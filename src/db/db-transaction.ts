import { Logger } from '../logger'
import   mysql    from 'mysql'
import  util from 'util'
export class Transaction {
  private connection !: mysql.PoolConnection
  private logger      : Logger

  constructor(pool : mysql.Pool, logger : Logger) {
    this.logger = logger
    this.begin(pool)
  }


  public async begin(pool : mysql.Pool) {
    const getConnection = util.promisify(pool.getConnection)
    this.connection = await getConnection()
    this.connection.beginTransaction()
  }
   
  public async query(query : string) {

    const queryFunction = util.promisify(this.connection.query)
    const result = await queryFunction(query)
    return result
  }

  public async rollback() {
    const rollback = util.promisify(this.connection.rollback)
    await rollback()
  }

  public async end() {
    try{
      this.connection.commit()
    } catch (err) {
      this.logger.error('DB_ERROR', 'Error while commiting the transaction')
      this.rollback()
    }
    this.connection.end()
  }
}