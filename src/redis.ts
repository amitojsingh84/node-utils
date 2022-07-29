import { Logger }       from './logger'
import { createClient } from 'redis'
import { APError }      from './ap-error'
import { Errors }        from './errors'
import { REDIS_CONSTANTS } from './redis-constants'

export class RedisOperations {
  private _connected : boolean = false
  private _client : any
  private logger : Logger

  constructor(config : any, logger : Logger) {
    this._client = createClient({url : config.REDIS_URL})
    this._client.on('error', (err : Error) => {
      this.logger.error('Redis client error. %s', err)
    })
    this.logger = logger
  }
  

  public async connect() {
    if(!this._connected) {
      this.logger.debug('Connecting to redis server.')
      await this._client.connect()
      this._connected = true
    }
  }

  public async disconnect() {
    if(this._connected) {
      this.logger.debug('Disconnecting from redis server.')
      await this._client.disconnect()
      this._connected = false
    }
  }

  public async runCommand(command : string, ...params : any[]) {
    if(!this._connected) {
      this.logger.error('Redis client not connected. %s', this._connected)
      throw new APError(Errors.name.REDIS_NOT_CONNECTED, Errors.message.REDIS_NOT_CONNECTED)
    }

    this.logger.info('Sending redis command %s %s', command, JSON.stringify(params))
    try {
      return await this._client.sendCommand([command, ...params])
    } catch(e) {
      this.logger.error('Error in redis command. %s %s %s', command, JSON.stringify(params), e)
      throw new APError(Errors.name.REDIS_ERROR, Errors.message.REDIS_ERROR)
    }
  }

  public async hget(mapName : string, key : string) {
    return await this._runCommand(REDIS_CONSTANTS.COMMANDS.HGET, mapName, key)
  }

  public async hgetall(mapName : string) {
    return await this._runCommand('HGETALL', mapName)
  }

  public async hset(mapName : string, key : string, data : string) {
    return await this._runCommand(REDIS_CONSTANTS.COMMANDS.HSET, mapName, key, data)
  }

  public async hdel(mapName : string, key : string) {
    return await this._runCommand(REDIS_CONSTANTS.COMMANDS.HDEL, mapName, key)
  }

/*------------------------------------------------------------------------------
  PRIVATE METHODS
------------------------------------------------------------------------------*/ 

  private async _runCommand(command : string, ...params : any[]) {
    this.logger.info('Running redis command %s %s', command, JSON.stringify(params))

    try {
      await this.connect()
      return await this.runCommand(command, ...params)
    } catch(e) {
      this.logger.error('Error in redis command. %s %s %s', command, JSON.stringify(params), e)
      throw new APError(Errors.name.REDIS_ERROR, Errors.message.REDIS_ERROR)
    } finally {
      await this.disconnect()
    }
  }

}
