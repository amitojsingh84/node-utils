import { Logger }       from './logger'
import { createClient } from 'redis'


export class RedisUtility {

  private connectionConfig : any
  private logger           : Logger
  private client           : any

  constructor(logger : Logger, connectionConfig : any) {
    this.connectionConfig = connectionConfig
    this.logger           = logger
  }
  
  async createRedisConnection() {
    this.client = createClient(this.connectionConfig)

    this.client.on('error', (err : any) => {
      this.logger.error('Redis Client Error %s', err)
    })

    await this.client.connect()
  }

  async addValues(key: any, value : any) {
    await this.client.set(key, value)    
  }

  async getValues(key : any) {
    const value = await this.client.get(key)
    console.log(value)
  }  
}

