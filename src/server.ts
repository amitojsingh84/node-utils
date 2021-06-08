import * as http   from 'http'
import * as https  from 'https'
import * as fs     from 'fs'
import * as lo     from 'lodash'
import * as qs     from 'querystring'
import * as URL    from 'url'
import { Router }  from './router'
import { Logger }  from './logger'
import { HTTP }    from './http-constatnts'

const UTF8 = 'utf8'

export class Server {

  private server : https.Server | http.Server
  private router : Router
  private logger : Logger

  constructor(keyPath : string, certPath : string, private port : number, router : Router, logger : Logger) {
    
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

    this.runServer()
  }

  async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {

    const { headers, method, url }          = req,
          requestId                : any    = headers[HTTP.HeaderKey.requestId]
                                                ? headers[HTTP.HeaderKey.requestId]?.slice(0, 3) 
                                                : this.getRandomRequestId(),
          requestLogger            : Logger = this.logger.cloneLogger(requestId)

    this.logger.debug('handleRequest %s %s', method, url)

    if(!method || !url) {
      this.logger.debug('Invalid request %s %s', method, url)
      this.router.sendErrorResponse(res, 'Invalid request', 404, HTTP.HeaderValue.json)
      return
    }

    this.logger.debug('Method and Url %s %s', method, url)

    const api = await this.router.verifyRequest(requestLogger, method, url, res)
    this.logger.debug('verified request %s %s', method, url)

    const query = URL.parse(url).query
    this.logger.debug('query %s', query)

    let params = {}

    switch(method) {

      case HTTP.Method.GET  :
        params = this.parseQuery(query)
        break

      case HTTP.Method.POST :
        params = this.parseBody(req, res)
        break

      default :
        this.logger.error('Rejecting request with invalid method %s %s', method, url)
        this.router.sendErrorResponse(res, 'Rejecting request with invalid method', 404, HTTP.HeaderValue.json)
    }

    await this.router.callApi(requestLogger, api, params, res)
  }

  async parseQuery(query : string | null) {
    this.logger.debug('parseQuery %s', query)

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
    this.logger.debug('Query parsed %s %s', query, params)
    return params
  }

  async parseBody(req : http.IncomingMessage, res : http.ServerResponse) {
    this.logger.debug('parseQuery')

    const body : string = await new Promise((resolve, reject) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      }).on('end', () => {
        resolve(body)
      }).on('error', (err) => {
        reject(err)
      })
    })

    this.logger.debug('parseQuery body %s', body)

    switch (req.headers[HTTP.HeaderKey.contentType]) {
      case HTTP.HeaderValue.form :
        return this.parseQuery(body)

      default :
        try {
          return JSON.parse(body)
        } catch (err) {
          this.logger.error('Could not parse post data as json %s', body)
          this.router.sendErrorResponse(res, 'Could not parse post data as json', 404, HTTP.HeaderValue.json)
          return { body }
        }
    }
  }

  runServer() {
    this.server.listen(this.port)
    this.server.on('error', this.onError)
    this.server.on('listening', this.onListening.bind(this, this.port))
  }
  
  onError(err : any) {
    console.error('Error on server. %s', err)
    process.exit(1)
  }

  onListening(port : number) {
    console.info('Server listening', port)
  }

  getRandomRequestId() {
    const requestId = `${this.getRandomCharacter()}${this.getRandomCharacter()}${this.getRandomCharacter()}`
  
    return requestId
  }

  getRandomCharacter() {
    return String.fromCharCode(65 + lo.random(0, 25, false))
  }
} 