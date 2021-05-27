import {
          createLogger,
          transports,
          format
        }                 from 'winston'
import    moment          from 'moment'
import    DailyRotateFile from 'winston-daily-rotate-file'
import { 
          getNamespace
        }                 from 'cls-hooked'
import { 
          HTTP
        }                 from './http-constants'

const DATE_TIME_FORMAT = 'HH:mm:ss.SSS DD-MM-YYYY',
      LOG_DIR          = './logs',
      LOG_LEVEL        = 'silly'

function getRequestId() {
  const myRequest = getNamespace(HTTP.Constants.namespaceName),
        requestId = myRequest && myRequest.get(HTTP.Constants.requestId) || HTTP.Constants.defaultRequestId

  return requestId
}

const consoleFormat = format.combine(format.colorize({ all : true }),
                                     format.splat(),
                                     format.prettyPrint(),
                                     format.printf(info => `${info.message}`))

const winstonLogger = createLogger({
  level      : LOG_LEVEL,
  format     : format.combine(
    format.splat(),
    format.prettyPrint(),
    format.printf(info => `${info.message}`)
  ),
  transports : [
    new transports.Console({ format : format.combine(format.colorize(), consoleFormat) }),
    new DailyRotateFile({
      dirname     : LOG_DIR,
      filename    : '%DATE%.log',
      datePattern : 'DD-MM-YYYY'
    })
  ]
})

const logger = {
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

export { logger }