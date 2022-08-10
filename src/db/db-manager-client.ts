import { Logger }  from "../logger"
import { APError } from '../ap-error'
import { Errors }  from '../errors'
import { Config }  from './db-manager-base'
import Bluebird from "bluebird"
import mysql from 'promise-mysql'

export class DbClient {
  private logger      : Logger
  private poolConfig  : Config
  private clientPool !: mysql.Pool
  private initialized : boolean = false

  constructor(config : Config, logger : Logger) {
    logger.debug('Constructing new oracle db client')
    this.logger = logger
    this.poolConfig = config

  }

  public async init() {
    this.logger.debug('Initializing OracleDbClient.')
    try{
    this.clientPool = await mysql.createPool({
        connectionLimit : 50,
        connectTimeout  : 20000,
        acquireTimeout  : 20000,
        host            : this.poolConfig.DB_HOST,
        port            : this.poolConfig.DB_PORT,
        user            : this.poolConfig.DB_USER,
        password        : this.poolConfig.DB_PASSWORD,
        database        : this.poolConfig.DB_NAME
     })
   } catch(e) {
    throw new APError('DB_POOL_NOT_INITIALIZED', ' Error in creating DB pool')
   }
   this.initialized = true
  }
  
  public async beginTransaction() : Promise<mysql.PoolConnection> {
    const connection = await this.clientPool.getConnection()
    connection.beginTransaction()
    return connection
  }

  public async endTransaction(connection : mysql.PoolConnection) {
    connection.commit()
    connection.release()
  }
  
  public async close() {
    if(!this.initialized) return
    this.logger.debug('Closing Db Connection pool')
    await this.clientPool.end()
    this.initialized = false
  }

  public async query(table     : string,
                     fields    : [{field   : string, AS ?      : string}],
                     queryObj  : [{queryKey: string, queryValue: number|string}],
                     limit     : number    = -1,
                     connection: mysql.PoolConnection
                     ) {
    this.logger.debug('Fetching from table', table)
    const fieldStr = [] as Array<string>,
          query    = [] as Array<string>

    for(const object of fields) {
      let str = object.field
      if(object.AS !== undefined) {
        str += `AS ${object.AS}`
      }
      fieldStr.push(str)
    }
    
    for(const object of queryObj){
      query.push(`${object.queryKey} = ${object.queryValue}`)
    }
    
    let queryStr = `SELECT ${fieldStr.join(', ')} FROM ${table} WHERE ${query.join('AND ')} `
    if(limit !== -1) {
      queryStr += `LIMIT ${limit}`
    }
		return this.executeQuery(queryStr, connection)
  }

  public async insert(table     : string,
                      entity    : [{key: string, value: string|number}],
                      userId    : string,
                      connection: mysql.PoolConnection) {
    this.logger.debug('Inserting into table, ' + table + '.', entity)
    const keys   = [] as Array<string>,
          values = [] as Array<string|number>
    for (const object of entity) {
      keys.push(object.key)
      values.push(object.value)
    }
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES 
                   (${values.join(', ')})` 
    
    return this.executeEditQuery('INSERT', query, table, userId, connection)               

  }

  public async update(table     : string,
                      updates   : [{key     : string, value    : string|number}],
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string,
                      connection: mysql.PoolConnection) {
    this.logger.debug(`Updating ${table} with updates : ${updates} for ${queryObj} `)
    const changes = [] as Array<string>,
          queries = [] as Array<string>
    
    for(const object of updates) {
      changes.push(`${object.key} = ${object.value}`)
    } 
    
    for(const object of queryObj){
      queries.push(`${object.queryKey} ${object.comparator} ${object.queryValue}`)
    }

    const query = `UPDATE TABLE ${table} SET ${changes.join(', ')} WHERE
                   ${queries.join('AND ')}` 
    return this.executeEditQuery('UPDATE', query, table, userId, connection)    
  }

  public async delete(table     : string,
                      queryObj: [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string,
                      connection: mysql.PoolConnection) {
    
    this.logger.debug(`Delete from ${table} where ${queryObj}`) 
    const condition = [] as Array<string>
    for(const object of queryObj){
      condition.push(`${object.queryKey} ${object.comparator} ${object.queryValue}`)
    } 
    const query = `DELETE FROM ${table} WHERE ${condition.join('AND ')}` 

    return this.executeEditQuery('DELETE', query, table, userId, connection)                  
  }

/*------------------------------------------------------------------------------
	 PRIVATE METHODS
------------------------------------------------------------------------------*/
  
  public async executeEditQuery(type : string, query : string, table : string, userId : string,
                                connection : mysql.PoolConnection) {

    if(!this.initialized) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    this.logger.info('executeEditQuery %s %s %s %s', type, query, table, userId)
    const result : Object[] = await this.executeQuery(query, connection)

    return result
  }

  public async executeQuery(query : string, connection : mysql.PoolConnection) {

    if(!this.initialized) {
      this.logger.error('DB is not initialized.')
      throw new APError(Errors.name.DB_NOT_INITIALIZED, Errors.message.DB_NOT_INITIALIZED)
    }

    try {
      const result = await this.clientPool.query(query)
      return result
    } catch(e) {
      connection.rollback()
      this.logger.error('executeQuery error %s', e)
      throw new APError(Errors.name.DB_ERROR, Errors.message.DB_ERROR)
    }
  }


}