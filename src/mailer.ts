import {Logger} from './logger'
import {APError} from './ap-error'
import {Errors} from './errors'
import nodemailer from 'nodemailer'

class Mailer {
  private _config: any
  private _transport
  logger : Logger
  
  /**
   * @param config 
   *  service          : smtp service like gmail, hotmail etc
      host             : smtp host like smtp.gmail.com
      port             : smtp port number
      secureConnection : true or false based on connection
      senderEmail      : sender email
      senderPassword   : sender password
   */
  constructor(config: any) {
    this.logger     = new Logger('./logs', 'debug')
    this._config    = config
    this._transport = nodemailer.createTransport({
      host      : this._config.service,
      port      : this._config.port,
      secure    : this._config.secureConnection,
      requireTLS: true,
      auth: {
        user : this._config.senderEmail,
        pass : this._config.senderPassword
      }
    })
  }
  
  /**
   * Construct Email from the data provided and send it.
   * @param emailTemplate - object consists of data like 
   *  to       : email reciever array
   *  from     : sender email
   *  cc      ?: email array
   *  bcc     ?: email array
   *  subject  : subject for the particular email
   * @param emailArr - Array of emails
   * @param html - html content for email
   * @param attachments - Array of files
   */
   async constructAndSendEmail(emailTemplate: any, emailArr: any, html: unknown, attachments: any) {
    this.logger.debug('In constructAndSendEmail.%s %s %s', html, JSON.stringify(emailTemplate), JSON.stringify(emailArr))

    const { mailOptions, emailAttachments } = this._encodeEmail(emailTemplate, emailArr, html, attachments)    
    this.logger.debug('mailoptions are. %s', JSON.stringify(mailOptions))
    mailOptions.attachments = emailAttachments

    try {
      const resp = await this._transport.sendMail(mailOptions)
      if(resp.rejected.length) throw 'Reason: ' + JSON.stringify(resp.rejected)
      this.logger.debug('Email resp?. %s', JSON.stringify(resp))
    } catch(e) {
      this.logger.error('Error occured while sending email. %s', JSON.stringify(e))
      throw new APError(Errors.name.EMAIL_SENDING_FAILURE, Errors.message.EMAIL_SENDING_FAILURE)       
    }
  }
  private _encodeEmail(emailTemplate: any, emailArr: any, html: unknown, attachments: any): { mailOptions: any; emailAttachments: any } {
    throw new Error('Method not implemented.')
  }

}