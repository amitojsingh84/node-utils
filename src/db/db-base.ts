import { Logger } from '../logger'

export class DbManagerEntity {
  private entity: string

  constructor(entity: string) {
    this.entity = entity
  }

  public get entityName() {
    return this.entity
  }
}

export type Config = { 
  db_host     : string
  db_port     : number
  db_user     : string
  db_password : string
  db_name     : string 
}

export enum FieldType {
  PRIMARY = 1,
  MANDATORY,
  OPTIONAL
}
