import moment          from 'moment'
import * as winston    from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const DATE_TIME_FORMAT = 'HH:mm:ss.SSS DD-MM-YYYY',
      DATE_PATTERN     = 'DD-MM-YYYY',
      FILENAME         = '%DATE%.log'

export class Logger {

  private consoleFormat : winston.Logform.Format
  private winstonLogger : winston.Logger

  constructor(private logDir : string, private logLevel : string, private requestId : string = '---') {
    this.consoleFormat = winston.format.combine(winston.format.colorize({ all : true }),
                                                winston.format.splat(),
                                                winston.format.prettyPrint(),
                                                winston.format.printf(info => `${info.message}`))

    this.winstonLogger = winston.createLogger({
      level      : logLevel,
      format     : winston.format.combine(
        winston.format.splat(),
        winston.format.prettyPrint(),
        winston.format.printf(info => `${info.message}`)
      ),
      transports : [
        new winston.transports.Console({ format : winston.format.combine(winston.format.colorize(),
                                                                         this.consoleFormat) }),
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
  
  public error(msg : string, ...args : Array<string | number | Error | undefined | null>) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.error(msg, ...args)
  }

  public warn(msg : string, ...args : Array<string | number | Error | undefined | null>) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.warn(msg, ...args)
  }

  public info(msg : string, ...args : Array<string | number | Error | undefined | null>) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.info(msg, ...args)
  }

  public debug(msg : string, ...args : Array<string | number | Error | undefined | null>) {
    msg = `${moment().format(DATE_TIME_FORMAT)} ${this.requestId} ` + msg
    this.winstonLogger.debug(msg, ...args)
  }
}