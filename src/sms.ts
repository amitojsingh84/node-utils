import {Logger} from './logger'
import {executeHttpsRequest} from './https-requests'
import {HTTP} from './http-constants'

class Sms {
  
  _config: {PROTOCOL : number, HOST : string, PORT : number,PATH : string, USERNAME : string, PASSWORD : string,
            SENDER_ID : any, MSG_TYPE : string, RESPONSE : any}

  logger : Logger
  /**
   * @param config 
   *  PROTOCOL  : 'https:' | 'http'
      HOST      : sms provider url host
      PORT      : sms provider url port number
      PATH      : sms provider url path
      USERNAME  : sms provider username
      PASSWORD  : sms provider password
      SENDER_ID : sms provider senderId
      MSG_TYPE  : sms provider msgTyp
      RESPONSE  : sms provider response
   */
  
  constructor(config: {PROTOCOL : number, HOST : string, PORT : number,
     PATH : string, USERNAME : string, PASSWORD : string, SENDER_ID : any, 
     MSG_TYPE : string, RESPONSE : any}) {

    this._config = config
    this.logger  = new Logger('./logs', 'debug')
    
  } 
  
  async sendSms(mobile : number, message : string) {
    this.logger.debug('sendSms %s %s', mobile, message)

    const urlObj : {
      method ?: string
      protocol: number;
      hostname: string;
      port: number;
      pathname: string;
      query: {
          username: string;
          pass: string;
          senderid: any;
          msgtype: string;
          response: any;
          dest_mobileno: number;
          message: string;
        } }  = {
                      protocol : this._config.PROTOCOL,
                      hostname : this._config.HOST,
                      port     : this._config.PORT,
                      pathname : this._config.PATH,
                      query    : {
                        username      : this._config.USERNAME,
                        pass          : this._config.PASSWORD,
                        senderid      : this._config.SENDER_ID,
                        msgtype       : this._config.MSG_TYPE,
                        response      : this._config.RESPONSE,
                        dest_mobileno : mobile,
                        message
                      }
                    },
          options = urlObj

    options.method = HTTP.Method.GET

    this.logger.debug('SMS request to be sent. %s %s %s %s', mobile, message,
                 JSON.stringify(urlObj), JSON.stringify(options))
    try {
      await executeHttpsRequest(this.logger, urlObj, options, '')
    } catch(e) {
      this.logger.warn('Error in sending sms to mobile. %s %s %s', mobile, message, e)
    }
  }
  
    
}