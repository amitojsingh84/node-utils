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
  }

  async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {

    const { headers, method, url }          = req,
          requestId                : any    = headers[HTTP.HeaderKey.requestId]
                                                ? headers[HTTP.HeaderKey.requestId]?.slice(0, 3) 
                                                : this.getRandomRequestId()                                        

    this.logger.setRequestId(requestId)

    this.logger.debug('handleRequest %s %s', method, url)

    if(!method || !url) {
      this.logger.debug('Invalid request %s %s', method, url)
      this.router.sendErrorResponse(res, 'Invalid request', 404, HTTP.HeaderValue.json)
      return
    }

    const urlObj = URL.parse(url),
          query  = urlObj.query,
          path   = urlObj.pathname

    if(!path) return

    this.logger.debug('Method Url and path %s %s %s', method, url, path)

    const apiExists = this.router.verifyRequest(this.logger, method, path)

    if(!apiExists) {
      res.end(this.router.sendErrorResponse(res, 'Not found', 404, HTTP.HeaderValue.json))
      return
    }

    this.logger.debug('verified request %s %s', method, path)

    this.logger.debug('query %s', query)

    let params = {}

    switch(method) {

      case HTTP.Method.GET  :
        params = await this.parseQuery(query)
        break

      case HTTP.Method.POST :
        params = await this.parseBody(req, res)
        break

      default :
        this.logger.error('Rejecting request with invalid method %s %s %s', method, url, path)
        this.router.sendErrorResponse(res, 'Rejecting request with invalid method', 404, HTTP.HeaderValue.json)
    }

    await this.router.callApi(this.logger, method, path, params, res)
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
    this.logger.error('Error on server. %s', err)
    process.exit(1)
  }

  onListening(port : number) {
    this.logger.info('Server listening on %s', port)
  }

  getRandomRequestId() {
    const requestId = `${this.getRandomCharacter()}${this.getRandomCharacter()}${this.getRandomCharacter()}`
  
    return requestId
  }

  getRandomCharacter() {
    return String.fromCharCode(65 + lo.random(0, 25, false))
  }
} 