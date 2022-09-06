import  {FieldType}  from "./db-base"
import  {APError}    from '../ap-error'  
import  {Logger }    from '../logger'

export type FieldInfo = {
  name      : string
  mapping   : string
  type      : FieldType
  dataType  : string
  unique    : boolean
  indexed   : boolean
}

export class DbRegistry {
  private tableName          : string
  private fields             : Array<FieldInfo> = []
  private primaryKey        !: string
  private primaryKeyMapping !: string

  constructor(table : string) {
    this.tableName = table
  }

  addField(field : FieldInfo) {

    if(field.type === FieldType.PRIMARY) {
      if(this.primaryKey) {
        throw new APError('DB_ERROR', `Trying to add more than one primary key in table ${this.tableName}.`);
        
      }

      this.primaryKey        = field.name
      this.primaryKeyMapping = field.mapping
    }

    this.fields.push(field)
  }

  getPrimaryKey() : { name : string, mapping : string } {
    return { name : this.primaryKey, mapping : this.primaryKeyMapping }
  }

  getFields() : Array<FieldInfo> {
    return this.fields
  }

  getFieldMapping(name : string) : string {
    const field = this.fields.find((f : FieldInfo) => f.name === name)

    if(!field) {
      throw new APError('DB_ERROR_CODE', `Field doesnot exsist in table ${this.tableName}.`)
    }

    return field.mapping
  }

  getNotNullFields() : Array<FieldInfo> {
    return this.fields.filter((field : FieldInfo) => field.type != FieldType.OPTIONAL)
  }

  getFieldInfo(field : string) : FieldInfo {
    const info = this.fields.find((f : FieldInfo) => f.mapping === field)

    if(!info) {
      throw new APError('DB_ERROR_CODE', `Field ${field} doesnot exsist in table ${this.tableName}.`)
    }

    return info
  }
}

/*------------------------------------------------------------------------------
   Registry Manager
------------------------------------------------------------------------------*/
export type RegMap = {}
export class DbRegistryManager {

  private static regMap : Map<string, DbRegistry> 

  public static init(logger : Logger) {
    logger.debug('Initializing ObmopRegistryManager.')
  } 

  public static addEntity(entity : string) {
    this.regMap.set(entity, new DbRegistry(entity))
  }

  public static addField(entity     : string,
                         fieldName  : string,
                         fieldType  : FieldType,
                         dataType   : string,
                         unique     : boolean,
                         indexed    : boolean) {

    const registry  : any       = this.getRegistry(entity), // TODO  : remove any
          fieldInfo : FieldInfo = {
                                    name    : fieldName,
                                    mapping : fieldName.toLowerCase(),
                                    type    : fieldType,
                                    dataType,
                                    unique,
                                    indexed
                                  }

    registry.addField(fieldInfo)
  }
  
  public static getRegistry(entity : string) : DbRegistry | undefined {
    if(!this.regMap.get(entity)) this.regMap.set(entity, new DbRegistry(entity))
    return this.regMap.get(entity)
  }

}


