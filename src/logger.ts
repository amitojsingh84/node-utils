import {
         createLogger as winstonCreateLogger,
         transports,
         format
       }                    from 'winston'
import moment               from 'moment'
import DailyRotateFile      from 'winston-daily-rotate-file'

const DATE_TIME_FORMAT = 'HH:mm:ss.SSS DD-MM-YYYY',
      DATE_PATTERN     = 'DD-MM-YYYY',
      FILENAME         = '%DATE%.log'

export class Logger {

  private consoleFormat
  private winstonLogger

  constructor(private logDir : string, private logLevel : string, private requestId : string = '---') {
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

  public cloneLogger(requestId ?: string) : Logger {
     
    return new Logger(this.logDir, this.logLevel, requestId)
  }
  
  public error(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.error(msg, ...args)
  }

  public warn(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.warn(msg, ...args)
  }

  public info(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.info(msg, ...args)
  }

  public debug(msg : string, ...args : any) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.debug(msg, ...args)
  }
}