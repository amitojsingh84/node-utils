import * as http   from 'http'
import { Logger }  from './logger'
import { HTTP }    from './http-constatnts'
import { Errors }  from './errors'
import { APError } from './ap-error'

export type API = {
  fn        : (logger : Logger, params : any) => Promise<any>
  path      : string
  method    : string
  verifyFn ?: (logger : Logger, params : any) => Promise<any>
}
export type Registry = Array<API>

const OPERATION_SUCCESS : string = 'OperationSuccess',
      VALIDATION_ERROR  : string = 'ValidationError'

export abstract class Router {

  private registry : Registry = []

  public registerApi(logger    : Logger,
                     method    : string,
                     path      : string,
                     fn        : (logger : Logger, params : any) => Promise<any>,
                     verifyFn ?: (logger : Logger, params : any) => Promise<any>) {
    logger.debug('registerApi %s %s %s', method, path, JSON.stringify(fn))
    
    const api : API = { method, path, fn, verifyFn }
    this.registry.push(api)
  }

  public async verifyRequest(logger : Logger, method : string, path : string) : Promise<API> {
    logger.debug('verifyRequest %s %s', method, path)

    const api = this.registry.find((api : API) => api.method === method && api.path === path)

    logger.debug('Api %s %s', method, path)

    if(!api) {
      logger.debug('API not found %s', method)
      throw new APError(Errors.name.NOT_FOUND, Errors.message.NOT_FOUND)
    }
    
    return api
  }

  public async callApi(logger : Logger, api : API, params : any, res : http.ServerResponse) {

    logger.debug('callApi %s %s', JSON.stringify(api), params)

    try {

      if(api.verifyFn) await api.verifyFn(logger, params)
      
      const resp = await api.fn(logger, params)
      logger.debug('Sending success response %s', resp)

      return res.end(this.sendSuccessResponse(res, resp, HTTP.ErrorCode.OK, HTTP.HeaderValue.json))
    } catch(err) {
      logger.debug('Sending error response %s', err)
      return res.end(this.sendErrorResponse(res, [err], HTTP.ErrorCode.BAD_REQUEST, HTTP.HeaderValue.json))
    }
  }

  public sendErrorResponse(res         : http.ServerResponse,
                           errArr      : Array<string>,
                           statusCode  : number,
                           contentType : string) {
    res.writeHead(statusCode, { [HTTP.HeaderKey.contentType] : contentType })
    const data = {
      error              : VALIDATION_ERROR,
      [VALIDATION_ERROR] : errArr 
    }

    const resp = { data }
    return JSON.stringify(resp)
  }

/*------------------------------------------------------------------------------
PRIVATE METHODS
------------------------------------------------------------------------------*/

  private sendSuccessResponse(res : http.ServerResponse, response : any, statusCode : number, contentType : string) {
    res.writeHead(statusCode, { [HTTP.HeaderKey.contentType] : contentType })
    const data = {
      success : OPERATION_SUCCESS,
      response
    }

    const resp = { data }
    return JSON.stringify(resp)
  }
}