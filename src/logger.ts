import {
         createLogger as winstonCreateLogger,
         transports,
         format
       }                    from 'winston'
import { getNamespace }     from 'cls-hooked'
import moment               from 'moment'
import DailyRotateFile      from 'winston-daily-rotate-file'

const DATE_TIME_FORMAT = 'HH:mm:ss.SSS DD-MM-YYYY',
      namespaceName    = 'My Request',
      requestId        = 'requestId',
      defaultRequestId = '---',
      DATE_PATTERN     = 'DD-MM-YYYY',
      FILENAME         = '%DATE%.log'

class Logger {

  private consoleFormat
  private winstonLogger

  constructor(logDir : string, logLevel : string) {
    this.consoleFormat = format.combine(format.colorize({ all : true }),
                                         format.splat(),
                                         format.prettyPrint(),
                                         format.printf(info => `${info.message}`))

    this.winstonLogger = winstonCreateLogger({
      level      : logLevel,
      format     : format.combine(
        format.splat(),
        format.prettyPrint(),
        format.printf(info => `${info.message}`)
      ),
      transports : [
        new transports.Console({ format : format.combine(format.colorize(), this.consoleFormat) }),
        new DailyRotateFile({
          dirname     : logDir,
          filename    : FILENAME,
          datePattern : DATE_PATTERN
        })
      ]
    })
  }

  private getRequestId() {
    const myRequest   = getNamespace(namespaceName),
          myRequestId = myRequest && myRequest.get(requestId) || defaultRequestId
  
    return myRequestId
  }
    
  error(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.getRequestId()} ` + msg
    this.winstonLogger.error(msg, ...args)
  }

  warn(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.getRequestId()} ` + msg
    this.winstonLogger.warn(msg, ...args)
  }

  info(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.getRequestId()} ` + msg
    this.winstonLogger.info(msg, ...args)
  }

  debug(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.getRequestId()} ` + msg
    this.winstonLogger.debug(msg, ...args)
  }
}

export { Logger }