import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
// import * as url from 'url'
import { Router } from './router'
import { Logger } from './logger'

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

    const requestLogger = this.logger.cloneLogger() // pass new random requestId for each request
    const { method, url } = req

    if(!method || !url) {
      return
    }
    console.log(method)
    console.log(url)

    const params = await this.getData(req)

    await this.router.callApi(requestLogger, method, url, params, res)
  }

  async getData(req : http.IncomingMessage) {

    return await new Promise((resolve, reject) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk.toString()
      }).on('end', () => {
        resolve(body)
      }).on('error', (err) => {
        reject(err)
      })
    })
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
}   