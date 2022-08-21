import { Logger }  from '../logger'
import { APError } from '../ap-error'
import { Errors }  from '../errors'
import mysql from 'promise-mysql'

export class DbClient {
  private logger : Logger
  
  constructor(logger : Logger) {
    logger.debug('Constructing new oracle db client')
    this.logger = logger
    
  }
  
  public query(table     : string,
                     fields    : [{field   : string, AS ?      : string}],
                     queryObj  : [{queryKey: string, queryValue: number|string}],
                     limit     : number    = -1) {
    this.logger.debug('Fetching from table', table)
    const fieldStr = [] as Array<string>,
          query    = [] as Array<string>

    for(const object of fields) {
      let str = object.field
      if(object.AS !== undefined) {
        str += `AS ${object.AS}`
      }
      fieldStr.push(str)
    }
    
    for(const object of queryObj){
      query.push(`${object.queryKey} = ${object.queryValue}`)
    }
    
    let queryStr = `SELECT ${fieldStr.join(', ')} FROM ${table} WHERE ${query.join('AND ')} `
    if(limit !== -1) {
      queryStr += `LIMIT ${limit}`
    }
		return queryStr
  }

  public insert(table     : string,
                      entity    : [{key: string, value: string|number}],
                      userId    : string) {
    this.logger.debug('Inserting into table, ' + table + '.', entity)
    const keys   = [] as Array<string>,
          values = [] as Array<string|number>
    for (const object of entity) {
      keys.push(object.key)
      values.push(object.value)
    }
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES 
                   (${values.join(', ')})` 
    
    return query              

  }

  public update(table     : string,
                      updates   : [{key     : string, value    : string|number}],
                      queryObj  : [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string) {
    this.logger.debug(`Updating ${table} with updates : ${updates} for ${queryObj} `)
    const changes = [] as Array<string>,
          queries = [] as Array<string>
    
    for(const object of updates) {
      changes.push(`${object.key} = ${object.value}`)
    } 
    
    for(const object of queryObj){
      queries.push(`${object.queryKey} ${object.comparator} ${object.queryValue}`)
    }

    const query = `UPDATE TABLE ${table} SET ${changes.join(', ')} WHERE
                   ${queries.join('AND ')}`

    return query    
  }

  public delete(table     : string,
                      queryObj: [{queryKey: string,comparator: string, queryValue: number|string}],
                      userId    : string) {
    
    this.logger.debug(`Delete from ${table} where ${queryObj}`) 
    const condition = [] as Array<string>
    for(const object of queryObj){
      condition.push(`${object.queryKey} ${object.comparator} ${object.queryValue}`)
    } 
    const query = `DELETE FROM ${table} WHERE ${condition.join('AND ')}` 

    return query
  }

// /*------------------------------------------------------------------------------
// 	 PRIVATE METHODS
// ------------------------------------------------------------------------------*/
  
//   private async executeEditQuery(type : string, query : string, table : string, userId : string,
//                                 connection : mysql.PoolConnection) {


//     this.logger.info('executeEditQuery %s %s %s %s', type, query, table, userId)
//     const result = await this.executeQuery(query, connection)

//     return result
//   }

//   private async executeQuery(query : string, connection : mysql.PoolConnection) {
    
//     try {
//       const result = await connection.query(query)
//       return result
//     } catch(e) {
//       connection.rollback()
//       this.logger.error('executeQuery error %s', e)
//       throw new APError(Errors.name.DB_ERROR, Errors.message.DB_ERROR)
//     }
//   }


}