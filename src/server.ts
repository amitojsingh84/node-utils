import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import { Router } from './router'

const UTF8 = 'utf8'

export class Server {

  private server : https.Server | http.Server
  private router : Router

  constructor(keyPath : string, certPath : string, port : number, router : Router, logLevel : string, logDir : string) {
    
    try {
      this.router = router
      if(keyPath && certPath) {
        const key         = fs.readFileSync(keyPath, UTF8),
              cert        = fs.readFileSync(certPath, UTF8),
              credentials = { key, cert }
        
        this.server = https.createServer(credentials, this.handleRequest.bind(this))
                      
      } else {
        this.server = http.createServer(this.handleRequest.bind(this))
      }
      this.runServer(port)
    } catch (err) {
      throw err
    }
  }

  async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {
    
    this.router.handleApiPath(req.url)
    .then((data) => {
      res.end(data.callback(req, res))
    })
    .catch((err : any) => {
      throw err
    })
  }

  runServer(port : number) {
    this.server.listen(port)
    this.server.on('error', this.onError)
    this.server.on('listening', this.onListening)
  }
  
  onError(err : any) {
    console.error('Error on server. %s', err)
    process.exit(1)
  }

  onListening() {
    console.info('Server listening')
  }
}   