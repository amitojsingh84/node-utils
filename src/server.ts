import * as http   from 'http'
import * as https  from 'https'
import * as fs     from 'fs'
import * as lo     from 'lodash'
import * as qs     from 'querystring'
import * as URL    from 'url'
import { Router }  from './router'
import { Logger }  from './logger'
import { HTTP }    from './http-constatnts'
import { Errors }  from './errors'
import { APError } from './ap-error'

const UTF8        = 'utf8',
      HTTP_STRING = 'http://'

export class Server {

  private server : https.Server | http.Server
  private router : Router
  private logger : Logger

  constructor(private port : number, router : Router, logger : Logger, keyPath ?: string, certPath ?: string) {
    
    this.router = router
    this.logger = logger
    
    if(keyPath && certPath) {
      const key         = fs.readFileSync(keyPath, UTF8),
            cert        = fs.readFileSync(certPath, UTF8),
            credentials = { key, cert }
      
      this.server = https.createServer(credentials, this.handleRequest.bind(this))
                    
    } else {
      this.server = http.createServer(this.handleRequest.bind(this))
    }
  }

  public runServer() {
    this.server.listen(this.port)
    this.server.on('error', this.onError)
    this.server.on('listening', this.onListening.bind(this, this.port))
  }

/*------------------------------------------------------------------------------
PRIVATE METHODS
------------------------------------------------------------------------------*/

  private async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {

    const { headers, method, url }          = req,
          requestId                : any    = headers[HTTP.HeaderKey.requestId]
                                                ? headers[HTTP.HeaderKey.requestId]?.slice(0, 3) 
                                                : this.getRandomRequestId()

    const requestLogger : Logger        = this.logger.cloneLogger(requestId),
          errArr        : Array<string> = []

    requestLogger.debug('handleRequest %s %s', method, url)
    try {
      if(!method || !url) {
        requestLogger.error('Invalid request %s %s', method, url)
        throw new APError(Errors.name.INVALID_REQUEST, Errors.message.INVALID_REQUEST)
      }

      const baseUrl = [HTTP_STRING, headers.host].join(''),
            urlObj  = new URL.URL(url, baseUrl),
            query   = urlObj.search ? urlObj.search.slice(1) : urlObj.search,
            path    = urlObj.pathname

      if(!path) {
        requestLogger.error('Invalid request %s %s', method, url)
        throw new APError(Errors.name.INVALID_REQUEST, Errors.message.INVALID_REQUEST)
      }

      requestLogger.debug('Method Url and path %s %s %s', method, url, path)

      const api = await this.router.verifyRequest(requestLogger, method, path)
      requestLogger.debug('verified request %s %s', method, path)

      requestLogger.debug('query %s', query)

      let params = {}

      switch(method) {

        case HTTP.Method.GET  :
          params = await this.parseQuery(requestLogger, query)
          break

        case HTTP.Method.POST :
          params = await this.parseBody(requestLogger, req)
          break

        default :
          requestLogger.error('Rejecting request with invalid method %s %s %s', method, url, path)
          throw new APError(Errors.name.INVALID_METHOD, Errors.message.INVALID_METHOD)
      }

      await this.router.callApi(requestLogger, api, params, res)
    } catch(err) {
      res.end(this.router.sendErrorResponse(res, [err], HTTP.ErrorCode.BAD_REQUEST, HTTP.HeaderValue.json))
    }
  }

  private async parseQuery(requestLogger : Logger, query : string | null) {
    requestLogger.debug('parseQuery %s', query)

    if(!query) return {}

    const params         = qs.parse(query),
          keywords : any = {
                              true      : true,
                              false     : false,
                              null      : null,
                              undefined : undefined,
                              ''        : undefined
                           }

    for(const key of Object.keys(params)) {
      const value = params[key] as string

      if(value in keywords) {
        params[key] = keywords[value]
      }
    }
    requestLogger.debug('Query parsed %s %s', query, JSON.stringify(params))
    return params
  }

  private async parseBody(requestLogger : Logger, req : http.IncomingMessage) {
    requestLogger.debug('parseQuery')

    const body : string = await this.getData(req)

    requestLogger.debug('parseQuery body %s', body)

    switch (req.headers[HTTP.HeaderKey.contentType]) {
      case HTTP.HeaderValue.form :
        return this.parseQuery(requestLogger, body)

      default :
        try {
          return JSON.parse(body)
        } catch (err) {
          requestLogger.error('Could not parse post data as json %s', body)
          return { body }
        }
    }
  }
  
  private async getData(req : http.IncomingMessage) : Promise<string> {
    return await new Promise((resolve, reject) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk.toString()
      }).on('end', () => {
        resolve(data)
      }).on('error', (err) => {
        reject(err)
      })
    })
  }

  private onError(err : any) {
    this.logger.error('Error on server. %s', err)
    process.exit(1)
  }

  private onListening(port : number) {
    this.logger.info('Server listening on %s', port)
  }

  private getRandomRequestId() {
    const requestId = `${this.getRandomCharacter()}${this.getRandomCharacter()}${this.getRandomCharacter()}`
  
    return requestId
  }

  private getRandomCharacter() {
    return String.fromCharCode(65 + lo.random(0, 25, false))
  }
} 