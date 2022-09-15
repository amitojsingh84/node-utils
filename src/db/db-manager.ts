import { Logger }      from '../logger'
import { Config }      from './db-base'
import { APError }     from '../ap-error'
import { DbClient }    from './db-client'
import { Transaction } from './db-transaction'
import   mysql         from 'mysql'
import   util          from 'util'


export class DbManager {
  private logger      : Logger
  private config      : Config
  private clientPool !: mysql.Pool
  private dbClient    : DbClient
  private initialized : boolean = false
<<<<<<< HEAD

=======
  private transaction : Transaction
>>>>>>> 2e0c0542d3c3e0a8932c6cc33e5f7ad5d5624b07
  
  constructor(config: Config, logger : Logger) { 
    this.logger   = logger
    this.config   = config
    this.dbClient = new DbClient(logger)
<<<<<<< HEAD
    
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
=======
    try {
      this.clientPool = mysql.createPool({
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
    this.transaction = new Transaction(this.clientPool, logger)
  }
  
  // public async init() {
  //   try {
  //     this.clientPool = mysql.createPool({
  //       connectionLimit : 50,
  //       connectTimeout  : 20000,
  //       acquireTimeout  : 20000,
  //       host            : this.config.db_host,
  //       port            : this.config.db_port,
  //       user            : this.config.db_user,
  //       password        : this.config.db_password,
  //       database        : this.config.db_name
  //     }) 
  //   } catch(err) {
  //     throw new APError('DB_POOL_NOT_INITIALIZED', ' Error in creating DB pool')
  //   }
  //   this.initialized = true
  // }
>>>>>>> 2e0c0542d3c3e0a8932c6cc33e5f7ad5d5624b07

  public close() {
    if(!this.initialized) return
    this.logger.debug('Closing Db Connection pool')
    this.clientPool.end()
    this.initialized = false
  }


  public async insert(table      : string,
                      entity     : [{key: string, value: string|number}],
                      userId     : string ) {                    
    try {
      const query = this.dbClient.insert(table, entity, userId)
      return this.transaction.query(query)
    } catch(e) {
      this.transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

  public async query(table     : string,
                     fields    : [{field   : string, AS ?      : string}],
                     queryObj  : [{queryKey: string, queryValue: number|string}],
                     limit     : number    = -1) {
                         
    try {
      const query = this.dbClient.query(table, fields, queryObj, limit) 
      return this.transaction.query(query)   
    } catch(e) {
      this.transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
    
  }

  public async delete(table     : string,
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string) {

    try {  
    const query = this.dbClient.delete(table, queryObj, userId)
    return this.transaction.query(query)
    } catch(e) {
      this.transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

  public async update(table     : string,
                      updates   : [{key     : string, value    : string|number}],
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string) {
    try {
      const query = this.dbClient.update(table, updates, queryObj, userId)
      return this.transaction.query(query)
    } catch(e) {
      this.transaction.rollback()
      throw new APError('DB_ERROR', 'Error while executing the query')
    }
  }

}