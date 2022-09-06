import { Logger } from '../logger'
import   mysql    from 'promise-mysql'

export class Transaction {
  private connection !: mysql.PoolConnection
  private logger      : Logger

  constructor(pool : mysql.Pool, logger : Logger) {
    this.logger = logger
    this.begin(pool)
  }

  private async begin(pool : mysql.Pool) {
    
    this.connection = await pool.getConnection()

    this.connection.beginTransaction()
  }
   
  public async query(query : string) {

    const result = await this.connection.query(query)
    return result
  }

  public async rollback() {
    await this.connection.rollback()
  }

  public async end() {
    try{
      await this.connection.commit()
    } catch (err) {
      this.logger.error('DB_ERROR', 'Error while commiting the transaction')
      await this.rollback()
    }
    await this.connection.end()
  }
}