import {
         createLogger,
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

function getRequestId() {
  const myRequest   = getNamespace(namespaceName),
        myRequestId = myRequest && myRequest.get(requestId) || defaultRequestId

  return myRequestId
}

export function createLoggerFunction(logDir : string, logLevel : string) {
  const consoleFormat = format.combine(format.colorize({ all : true }),
                                       format.splat(),
                                       format.prettyPrint(),
                                       format.printf(info => `${info.message}`))

  const winstonLogger = createLogger({
    level      : logLevel,
    format     : format.combine(
      format.splat(),
      format.prettyPrint(),
      format.printf(info => `${info.message}`)
    ),
    transports : [
      new transports.Console({ format : format.combine(format.colorize(), consoleFormat) }),
      new DailyRotateFile({
        dirname     : logDir,
        filename    : FILENAME,
        datePattern : DATE_PATTERN
      })
    ]
  })

  const Logger = {
    error : (msg : string, ...args : any) => {
      msg = `${moment().format(DATE_TIME_FORMAT)} ${getRequestId()} ` + msg
      winstonLogger.error(msg, ...args)
    },
    warn  : (msg : string, ...args : any) => {
      msg = `${moment().format(DATE_TIME_FORMAT)} ${getRequestId()} ` + msg
      winstonLogger.warn(msg, ...args)
    },
    info  : (msg : string, ...args : any) => {
      msg = `${moment().format(DATE_TIME_FORMAT)} ${getRequestId()} ` + msg
      winstonLogger.info(msg, ...args)
    },
    debug : (msg : string, ...args : any) => {
      msg = `${moment().format(DATE_TIME_FORMAT)} ${getRequestId()} ` + msg
      winstonLogger.debug(msg, ...args)
    }
  }

  return Logger
}



// TODO export function createLogger(logDir, logLevel) : Logger
// Logger will have logging functions

// export { logger }