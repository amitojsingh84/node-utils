import { format } from 'mysql'
import mysql from 'promise-mysql'
import { Logger } from './logger'
import { APError } from './ap-error'
import { Errors } from './errors'
import { UtilFunctions } from './other-utils'

const COMMA : string = ', '

class DatabaseOperations {
  
  logger     : Logger
  format     : (sql: string, values: any[], stringifyObjects?: boolean | undefined, timeZone?: string | undefined) => string
  _init      : boolean
  _pool      !: mysql.Pool
  DB_OFF     : boolean
  
  /**
   * @param config 
   *  
      DB_HOST    : DB host 
      DB_PORT    : DB port
      DB_USER    : DB user name
      DB_PASSWORD: DB password
      DB_NAME    : DB name
      
   */
  constructor(config: { DB_HOST: string; DB_PORT: number; DB_USER: string; DB_PASSWORD: string; DB_NAME: string }) {
    this.logger      = new Logger('./logs', 'debug')
    this.format      = format
    this._init       = true
    this.DB_OFF      = false,
    (async () => {
      this._pool = await mysql.createPool({
        connectionLimit : 50,
        connectTimeout  : 20000,
        acquireTimeout  : 20000,
        host            : config.DB_HOST,
        port            : config.DB_PORT,
        user            : config.DB_USER,
        password        : config.DB_PASSWORD,
        database        : config.DB_NAME
      })
    })()
    
  }

    
  async executeEditQuery(type : string, query : string, tableName : string, userId : string) : Promise<any[]> {

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.info('executeEditQuery %s %s %s %s', type, UtilFunctions.getQueryLogStr(query), tableName, userId)
    const result : any[] = await this.executeQuery(query)

    return result
  }

  async executeQuery(query : string) : Promise<any[]> {

    if(this.DB_OFF) {
      this.logger.error('DB is down. %s', this.DB_OFF)
      throw new APError(Errors.name.DB_ERROR, Errors.message.DB_DOWN)
    }

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    try {
      const result : any[] = await this._pool.query(query)

      this.logger.debug('executeQuery %s %s', UtilFunctions.getQueryLogStr(query), JSON.stringify(result))           

      return result
    } catch(e) {
      this.logger.error('executeQuery error %s %s', UtilFunctions.getQueryLogStr(query), e)
      throw new APError(Errors.name.DB_ERROR, Errors.message.DB_ERROR)
    }
  }

  addQueryClause(params : any[], key : string, value : string, operator : string) : string{

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.debug('addQueryClause. %s %s %s %s', JSON.stringify(params), key, value, operator)

    if(value !== undefined) {
      params.push(value)
      return ` AND ${key} ${operator} ?`
    }
    
    return ` AND ${key} ${operator}`
  }

  addOrderClause(orderByArr : any[]) : string | undefined {

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    if(!orderByArr.length) return

    this.logger.debug('addOrderClause. %s', JSON.stringify(orderByArr))

    const orderByValues : string[] = orderByArr.map((value) => `${value.key}${value.order !== undefined ?
                                                                                             ` ${value.order}` : ''}`),
          clause        : string   = ` ORDER BY ` + orderByValues.join(COMMA)

    return clause
  }

  addLimitClause(params : any[], startIndex : number, pageSize : number) : string{
    
    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.debug('addLimitClause. %s %s %s', JSON.stringify(params), startIndex, pageSize)

    if(!pageSize) return ''

    const clause : string = ` LIMIT ?, ?`
    params.push(startIndex)
    params.push(pageSize)

    return clause
  }

  async close() : Promise<void>{

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.info('Closing DB.')
    if(!this._pool) return

    const pool =  this._pool
    await pool.end()

    //this._pool = null
    this._init = false
  }
}