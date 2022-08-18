import {Logger}   from '../logger'
import {Config}   from './db-base'
import {APError}  from '../ap-error'
import {DbClient} from './db-client'
import  mysql     from 'promise-mysql'


export class DbManager {

  private connection ?: mysql.PoolConnection
  private logger      : Logger
  private config      : Config
  private clientPool ?: mysql.Pool
  private dbClient    : DbClient
  private initialized : boolean = false
  
  constructor(config: Config, logger : Logger) { 
    this.logger   = logger
    this.config   = config
    this.dbClient = new DbClient(logger)
  }
  
  public async init() {
    try{
    this.clientPool = await mysql.createPool({
      connectionLimit : 50,
      connectTimeout  : 20000,
      acquireTimeout  : 20000,
      host            : this.config.db_host,
      port            : this.config.db_port,
      user            : this.config.db_user,
      password        : this.config.db_password,
      database        : this.config.db_name
   }) 
  } catch(err) {
    throw new APError('DB_POOL_NOT_INITIALIZED', ' Error in creating DB pool')
   }

   this.initialized = true
   
  }

  public async beginTransaction() {
    
    this.connection = await this.clientPool.getConnection()

    this.connection.beginTransaction()
    return this.connection
  }

  public async endTransaction() {
    try{
      await this.connection.commit()
    } catch (err) {
      this.logger.error('DB_ERROR', 'Error while commiting the transaction')
    }
    await this.connection.end()
  }

  public close() {
    if(!this.initialized) return
    this.logger.debug('Closing Db Connection pool')
    this.clientPool.end()
    this.initialized = false
  }

  public async insert(table     : string,
                      entity    : [{key: string, value: string|number}],
                      userId    : string) {
    try {
      return this.dbClient.insert(table, entity, userId, this.connection)
    } catch(e) {
      this.connection.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

  public async query( table     : string,
                      fields    : [{field   : string, AS ?      : string}],
                      queryObj  : [{queryKey: string, queryValue: number|string}],
                      limit     : number    = -1,) {
                         
    try {
      
      return this.dbClient.query(table, fields, queryObj, limit, this.connection)        
    } catch(e) {
      this.connection.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
    
  }

  public async delete(table     : string,
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string) {

    try {  
    return this.dbClient.delete(table, queryObj, userId, this.connection)
    } catch(e) {
      this.connection.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

  public async update(table     : string,
                      updates   : [{key     : string, value    : string|number}],
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string) {
    try {
      return this.dbClient.update(table, updates, queryObj, userId, this.connection)
    } catch(e) {
      this.connection.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

}