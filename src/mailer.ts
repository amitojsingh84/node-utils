import { Logger }      from './logger'
import { APError }     from './ap-error'
import { Errors }      from './errors'
import   nodemailer    from 'nodemailer'
import   SMTPTransport from 'nodemailer/lib/smtp-transport'

type Config = {
  service          : string,
  host             : string,
  port             : number,
  secureConnection : boolean,
  senderEmail      : string,
  senderPassword   : string
}


export class Mailer {
  private _config    : Config 
  private _transport : nodemailer.Transporter<SMTPTransport.SentMessageInfo>
  private logger     : Logger

  /**
   * @param config 
   *  service          : smtp service like gmail, hotmail etc
      host             : smtp host like smtp.gmail.com
      port             : smtp port number
      secureConnection : true or false based on connection
      senderEmail      : sender email
      senderPassword   : sender password
   */
  constructor(config: Config) {
    this.logger = new Logger('./logs', 'debug')//todo
    this._config = config
    this._transport = nodemailer.createTransport({
      host: this._config.service,
      port: this._config.port,
      secure: this._config.secureConnection,
      requireTLS: true,
      auth: {
        user: this._config.senderEmail,
        pass: this._config.senderPassword
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
  async constructAndSendEmail(emailTemplate: { id: string, templateName: string, subject: string, to: string[], 
    cc: string[], bcc: string[], status: string, from : string}, emailArr: string[], html: any, attachments: any[]) {
    this.logger.debug('In constructAndSendEmail.%s %s %s', html, JSON.stringify(emailTemplate), JSON.stringify(emailArr))

    const { mailOptions, emailAttachments } = this._encodeEmail(emailTemplate, emailArr, html, attachments)
    this.logger.debug('mailoptions are. %s', JSON.stringify(mailOptions))
    mailOptions.attachments = emailAttachments

    try {
      const resp = await this._transport.sendMail(mailOptions)
      if (resp.rejected.length) throw 'Reason: ' + JSON.stringify(resp.rejected)
      this.logger.debug('Email resp?. %s', JSON.stringify(resp))
    } catch (e) {
      this.logger.error('Error occurred while sending email. %s', JSON.stringify(e))
      throw new APError(Errors.name.EMAIL_SENDING_FAILURE, Errors.message.EMAIL_SENDING_FAILURE)
    }
  }

  /*------------------------------------------------------------------------------
    PRIVATE METHODS
  ------------------------------------------------------------------------------*/

  //[{
//     filename : FILE_NAME,
//     content  : bufferData
//  }],


  private _encodeEmail(emailTemplate: { id: string, templateName: string, subject: string, to: string[], cc: string[],
    bcc: string[], status: string, from : string}, emailArr: string[], html: string, attachments: any[]) { //todo : type
    this.logger.debug('In _encodeEmail.%s %s %s', html, JSON.stringify(emailTemplate), JSON.stringify(emailArr))

    const emailSubject : string         = emailTemplate.subject ?? null,
          emailTo : string[]            = emailTemplate.to ?? [],
          emails : string[]             = [...emailArr, ...emailTo],
          uniqRecieverEmails : string[] = [...new Set(emails)],
          emailCc : string[]            = emailTemplate.cc ?? [],
          uniqCcEmails : string[]       = [...new Set(emailCc)],
          emailBcc : string[]           = emailTemplate.bcc ?? [],
          uniqBccEmails : string[]      = [...new Set(emailBcc)],
          emailHtml : any               = html ?? null,
          emailAttachments : any[]      = attachments || []

    if (!uniqRecieverEmails || !uniqRecieverEmails.length) {
      this.logger.error('reciever emails required')
      throw new APError(Errors.name.RECIEVER_EMAILS_REQUIRED, Errors.message.RECIEVER_EMAILS_REQUIRED)
    }

    if (!emailSubject) {
      this.logger.error('Email subject required')
      throw new APError(Errors.name.EMAIL_SUBJECT_REQUIRED, Errors.message.EMAIL_SUBJECT_REQUIRED)
    }

    if (emailHtml === undefined || emailHtml == null) {
      this.logger.error('Email html template required')
      throw new APError(Errors.name.EMAIL_BODY_REQUIRED, Errors.message.EMAIL_BODY_REQUIRED)
    }

    const mailOptions = {
      to          : uniqRecieverEmails,
      from        : this._config.senderEmail,
      subject     : emailSubject,
      bcc         : uniqBccEmails,
      cc          : uniqCcEmails,
      html        : emailHtml,
      attachments : emailAttachments
    }

    return { mailOptions, emailAttachments }
  }

}