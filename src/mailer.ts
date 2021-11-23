import { Logger }      from './logger'
import { APError }     from './ap-error'
import { Errors }      from './errors'
import * as nodemailer from 'nodemailer'

type Config = {
  service          : string
  host             : string
  port             : string
  secureConnection : boolean
  senderEmail      : string
  senderPassword   : string
}

type EmailTemplate = {
  subject : string
  to      : string[]
  cc      : string[]
  bcc     : string[]
}

type MailOptions = {
  to          : string | string[]
  from        : string
  subject     : string
  bcc         : string | string[]
  cc          : string | string[]
  html        : string
  attachments ?: string | string[]
}

export type customTransport = {
  service          : string,
  host             : string
  Port             : string,
  secureConnection : boolean,
  auth             : {
    user : string,
    pass : string
  }
}

class Mailer {  
  
  /**
   * @param config 
   *  service        : smtp service like gmail, hotmail etc,
      host           : smtp host like smtp.gmail.com,
      port           : smtp port number,
      secure         : true or false based on connection,
      senderEmail    : sender email,
      senderPassword : sender password
      
    }
   */

  private config    : Config
  private transport : any
  
  constructor(config : Config) {
    this.config = config

    this.transport = nodemailer.createTransport<customTransport>({
      service          : this.config.service,
      host             : this.config.host,
      Port             : this.config.port,
      secureConnection : this.config.secureConnection,
      auth             : {
        user : this.config.senderEmail,
        pass : this.config.senderPassword
      }
    } as any)
  }

  /**
   * Construct Email from the data provided and send it.
   * @param emailData - object consists of data like 
   * to: email receiver array
   * from: sender email
   * cc?: email array
   * bcc?: email array
   * subject: subject for the particular email
   * html: html template
   * attachments?: Array of files
   */
  async constructAndSendEmail(logger:Logger, emailTemplate:EmailTemplate, emailArr:string[], html:string, 
                              attachments:string[]) {
    logger.debug('In constructAndSendEmail.%s %s %s', html, JSON.stringify(emailTemplate), JSON.stringify(emailArr))

    const { mailOptions, emailAttachments } = this._encodeEmail(logger, emailTemplate, emailArr, html, attachments)    
    logger.debug('mailoptions are. %s', JSON.stringify(mailOptions))
    mailOptions.attachments = emailAttachments

    try {
      const resp = await this.transport.sendMail(mailOptions)
      if(resp.rejected.length) throw 'Reason: ' + JSON.stringify(resp.rejected)
      logger.debug('Email resp?. %s', JSON.stringify(resp))
    } catch(e) {
      logger.debug('Error occurred while sending email. %s', JSON.stringify(e))
      throw new APError(Errors.name.EMAIL_SENDING_FAILURE, Errors.message.EMAIL_SENDING_FAILURE)       
    }
  }

/*------------------------------------------------------------------------------
  PRIVATE METHODS
------------------------------------------------------------------------------*/

  _encodeEmail(logger : Logger, emailTemplate :EmailTemplate , emailArr : string[], html : string, attachments : string[]) {
    logger.debug('In _encodeEmail.%s %s %s', html, JSON.stringify(emailTemplate), JSON.stringify(emailArr))

    const emailSubject       = emailTemplate.subject ?? null,
          emailTo            = emailTemplate.to ?? [],
          emails             = [ ...emailArr, ...emailTo ],
          uniqRecieverEmails = [ ...new Set(emails) ],
          emailCc            = emailTemplate.cc ?? [],
          uniqCcEmails       = [ ...new Set(emailCc) ],          
          emailBcc           = emailTemplate.bcc ?? [],
          uniqBccEmails      = [ ...new Set(emailBcc) ],        
          emailHtml          = html ?? null,
          emailAttachments   = attachments || []

    if(!uniqRecieverEmails || !uniqRecieverEmails.length) {
      logger.debug('reciever emails required')
      throw new APError(Errors.name.RECIEVER_EMAILS_REQUIRED, Errors.message.RECIEVER_EMAILS_REQUIRED)
    }

    if(!emailSubject) {
      logger.debug('Email subject required')
      throw new APError(Errors.name.EMAIL_SUBJECT_REQUIRED, Errors.message.EMAIL_SUBJECT_REQUIRED)     
    }

    if(emailHtml === undefined || emailHtml == null) {
      logger.debug('Email html template required')
      throw new APError(Errors.name.EMAIL_BODY_REQUIRED, Errors.message.EMAIL_BODY_REQUIRED)
    }

    const mailOptions : MailOptions = {
      to      : uniqRecieverEmails,
      from    : this.config.senderEmail,
      subject : emailSubject,
      bcc     : uniqBccEmails,
      cc      : uniqCcEmails,
      html    : emailHtml
    }

    return { mailOptions, emailAttachments }
  }
}

module.exports = Mailer