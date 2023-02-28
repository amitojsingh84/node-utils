import { Logger }       from './logger'
import { createClient } from 'redis'


export class RedisOperations {

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

  async addValues(key: string, value : string) {
    await this.client.set(key, value) 
  }

  async getValues(key : string) {
    const value = await this.client.get(key)
    console.log(value)

  }

  async hset(a: string,b: string,c: string) {

  }
  async hget(a: string,b: string) {
return ''
  }
  async hdel(a: string,b: string) {

  }
}