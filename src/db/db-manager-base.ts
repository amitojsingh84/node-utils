import { Logger } from "../logger";

export class DbManagerEntity {
  private logger: Logger
  private _entity_name: string

  constructor(logger: Logger, entity_name: string) {
    this.logger = logger
    this.logger.debug('Inside DbManagerEntity')
    this._entity_name = entity_name
  }

  public get entity_name() {
    return this._entity_name
  }
}

export type Config = { 
  DB_HOST    : string
  DB_PORT    : number
  DB_USER    : string
  DB_PASSWORD: string
  DB_NAME    : string 
}
