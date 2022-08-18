import { Logger } from "../logger";

export class DbManagerEntity {
  private logger: Logger
  private entity: string

  constructor(logger: Logger, entity: string) {
    this.logger = logger
    this.logger.debug('Inside DbManagerEntity')
    this.entity = entity
  }

  public get entityName() {
    return this.entity
  }
}

export type Config = { 
  db_host   : string
  db_port    : number
  db_user    : string
  db_password: string
  db_name    : string 
}

export enum FieldType {
  PRIMARY = 1,
  MANDATORY,
  OPTIONAL
}
