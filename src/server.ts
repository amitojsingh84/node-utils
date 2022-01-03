import { Router }         from './router'
import { Logger }         from './logger'
import { HTTP }           from './http-constants'
import { Errors }         from './errors'
import { APError }        from './ap-error'
import { streamToString } from './utils'
import * as http          from 'http'
import * as https         from 'https'
import * as fs            from 'fs'
import * as lo            from 'lodash'
import * as qs            from 'querystring'
import * as url           from 'url'

const UTF8 = 'utf8',
      DASH = '-'

// TODO : move to constants
const PROTOCOLS = {
        HTTP  : 'http://',
        HTTPS : 'https://'
      }

export class Server {

  private server   : https.Server | http.Server
  private router   : Router
  private logger   : Logger
  private protocol : string

  constructor(private port : number, router : Router, logger : Logger, keyPath ?: string, certPath ?: string) {
    
    this.router = router
    this.logger = logger

    if(keyPath && certPath) {
      const key         = fs.readFileSync(keyPath, UTF8),
            cert        = fs.readFileSync(certPath, UTF8),
            credentials = { key, cert }
      
      this.server = https.createServer(credentials, this.handleRequest.bind(this))
      this.protocol = PROTOCOLS.HTTPS
    } else {
      this.server = http.createServer(this.handleRequest.bind(this))
      this.protocol = PROTOCOLS.HTTP
    }
  }

  public start() {
    this.server.listen(this.port)
    this.server.on('error', this.onError)
    this.server.on('listening', this.onListening.bind(this, this.port))
  }
  
  public stop() {
    this.server.close()
    this.logger.debug('server stopped.')
    process.exit()
  }

/*------------------------------------------------------------------------------
PRIVATE METHODS
------------------------------------------------------------------------------*/

  private async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {

    const { headers, method, url: reqUrl }  = req,
          requestId                         = this.getRequestId(headers)

    const requestLogger : Logger = this.logger.cloneLogger(requestId)

    requestLogger.debug('handleRequest %s %s', method, reqUrl)

    try {

      if(!method || !reqUrl) {
        requestLogger.error('Invalid request %s %s', method, reqUrl)
        this.router.sendNotFoundResponse(res, [Errors.message.NOT_FOUND])
        return
      }
      
      const baseUrl = [this.protocol, headers.host].join(''),
            urlObj  = new url.URL(reqUrl, baseUrl),
            query   = urlObj.search ? urlObj.search.slice(1) : urlObj.search,
            path    = urlObj.pathname

      requestLogger.debug('query and path %s %s', query, path)

      if(!path) {
        requestLogger.error('Invalid request %s %s', method, reqUrl)
        this.router.sendNotFoundResponse(res, [Errors.message.NOT_FOUND])
        return
      }

      requestLogger.debug('Method Url and path %s %s %s', method, reqUrl, path)

      const api = await this.router.verifyRequest(requestLogger, headers, method, path, res)
      
      requestLogger.debug('verified request %s %s', method, path)

      if(!api) {
        throw new APError(Errors.name.NOT_FOUND, Errors.message.NOT_FOUND)
      }

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
          requestLogger.error('Rejecting request with invalid method %s %s %s', method, reqUrl, path)
          throw new APError(Errors.name.INVALID_METHOD, Errors.message.INVALID_METHOD)
      }

      await this.router.invokeApi(requestLogger, api, params, res)
    } catch(err) {
      requestLogger.error('Some error occured')
    }
  }

  private async parseQuery(logger : Logger, query : string | null) {
    logger.debug('parseQuery %s', query)

    if(!query) return {}

    const params         = qs.parse(query),
          keywords : any = {
                              true      : true,
                              false     : false,
                              null      : null,
                              ''        : undefined
                           }

    for(const key of Object.keys(params)) {
      const value = params[key] as string

      if(value in keywords) {
        params[key] = keywords[value]
      }
    }
    logger.debug('Query parsed %s %s', query, JSON.stringify(params))
    return params
  }

  private async parseBody(logger : Logger, req : http.IncomingMessage) {
    logger.debug('parseQuery')

    const body : string = await streamToString(req)

    logger.debug('parseQuery body %s', body)

    switch (req.headers[HTTP.HeaderKey.contentType]) {
      case HTTP.HeaderValue.form :
        return this.parseQuery(logger, body)

      default :
        try {
          return JSON.parse(body)
        } catch (err) {
          logger.error('Could not parse post data as json %s', body)
          return { body }
        }
    }
  }

  private getRequestId(headers : http.IncomingHttpHeaders) {
    this.logger.debug('getting request id.')

    const requestId = headers[HTTP.HeaderKey.requestId]

    if(Array.isArray(requestId)) {
      return requestId[0].length >= 3 ? requestId[0].slice(0, 3) : this.requestId(requestId[0])
    }
    else if(requestId) {
      return requestId.length >= 3 ? requestId.slice(0, 3) : this.requestId(requestId)
    }
    else {
      return this.getRandomRequestId()
    }
  }

  private requestId(requestId : string) : string {

    switch(requestId.length) {
      case 1  : return [DASH, DASH, requestId].join('')
      case 2  : return [DASH, requestId].join('')
      default : return requestId
    }

  }

  private onError(err : any) {
    console.error('Error on server. %s', err)
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