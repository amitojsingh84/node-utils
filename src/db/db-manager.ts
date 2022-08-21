import {Logger}      from '../logger'
import {Config}      from './db-base'
import {APError}     from '../ap-error'
import {DbClient}    from './db-client'
import {Transaction} from './db-transaction'
import  mysql        from 'promise-mysql'


export class DbManager {
  private logger      : Logger
  private config      : Config
  private clientPool !: mysql.Pool
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

  public close() {
    if(!this.initialized) return
    this.logger.debug('Closing Db Connection pool')
    this.clientPool.end()
    this.initialized = false
  }

  public async insert(table      : string,
                      entity     : [{key: string, value: string|number}],
                      userId     : string, 
                      transaction: Transaction ) {
    const query = this.dbClient.insert(table, entity, userId)                    
    try {
      return this.dbClient.insert(table, entity, userId)
    } catch(e) {
      transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

  public async query( table     : string,
                      fields    : [{field   : string, AS ?      : string}],
                      queryObj  : [{queryKey: string, queryValue: number|string}],
                      limit     : number    = -1,
                      transaction : Transaction) {
                         
    try {
      const query = this.dbClient.query(table, fields, queryObj, limit) 
      return transaction.query(query)   
    } catch(e) {
      transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
    
  }

  public async delete(table     : string,
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string,
                      transaction : Transaction) {

    try {  
    const query = this.dbClient.delete(table, queryObj, userId)
    return transaction.query(query)
    } catch(e) {
      transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

  public async update(table     : string,
                      updates   : [{key     : string, value    : string|number}],
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string,
                      transaction : Transaction) {
    try {
      const query = this.dbClient.update(table, updates, queryObj, userId)
      return transaction.query(query)
    } catch(e) {
      transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

}