import { Logger }        from './logger'
import { APError }       from './ap-error'
import { Errors }        from './errors'
import { UtilFunctions } from './other-utils'
import { format }        from 'mysql'
import   mysql           from 'promise-mysql'

const COMMA : string = ', '

type Config = { 
      DB_HOST    : string
      DB_PORT    : number
      DB_USER    : string
      DB_PASSWORD: string
      DB_NAME    : string 
    }

export class DatabaseOperations {
  
  private logger     : Logger
  public format     : (sql: string, values: any[], stringifyObjects?: boolean | undefined, timeZone?: string | undefined)
                        => string
  private _init      : boolean
  private _pool     !: mysql.Pool
  private DB_OFF     : boolean
    
  /**
   * @param config 
   *  
      DB_HOST    : DB host 
      DB_PORT    : DB port
      DB_USER    : DB user name
      DB_PASSWORD: DB password
      DB_NAME    : DB name
      
   */

  constructor(config: Config, logger : Logger) { 
    this.logger      = logger
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
    
  public async executeEditQuery(type : string, query : string, tableName : string, userId : string) {

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.info('executeEditQuery %s %s %s %s', type, UtilFunctions.getQueryLogStr(query), tableName, userId)
    const result : Object[] = await this.executeQuery(query)

    return result
  }

  public async executeQuery(query : string) {

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

  public addQueryClause(params : (string | number)[], key : string, value : string, operator : string) : string {

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


  public addOrderClause(orderByArr : Array<any>) : string | undefined {

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

  public addLimitClause(params : any[], startIndex : number, pageSize : number) : string { 
    
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

  public async close() {

    if(!this._init) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.info('Closing DB.')
    if(!this._pool) return

    const pool =  this._pool
    await pool.end()

    this._init = false
  }
}