import { Logger }  from './logger'
import { HTTP }    from './http-constatnts'
import { Errors }  from './errors'
import * as http   from 'http'

export type API = {
  fn        : (logger : Logger, params : any) => Promise<any>
  path      : string
  method    : string
  verifyFn ?: (logger : Logger, params : any) => Promise<any>
}
export type Registry = Array<API>
export type Header = {[key : string] : Array<string> | string | undefined}

const OPERATION_SUCCESS : string = 'OperationSuccess',
      VALIDATION_ERROR  : string = 'ValidationError'

export abstract class Router {

  private registry : Registry = []

  abstract verifyApiRequest(logger : Logger, headers : Header,
                            method : string, url : string) : Promise<any>

  public registerApi(logger    : Logger,
                     method    : string,
                     path      : string,
                     fn        : (logger : Logger, params : any) => Promise<any>,
                     verifyFn ?: (logger : Logger, params : any) => Promise<any>) {
    logger.debug('registerApi %s %s %s', method, path, JSON.stringify(fn))
    
    const api : API = { method, path, fn, verifyFn }
    this.registry.push(api)
  }

  public async verifyRequest(logger  : Logger,
                             headers : Header,
                             method  : string,
                             path    : string,
                             res     : http.ServerResponse) : Promise<API | undefined> {
    logger.debug('verifyRequest %s %s', method, path)
    
    const api = this.registry.find((api : API) => api.method === method && api.path === path)

    logger.debug('Api %s %s', method, path)
    
    if(this.verifyApiRequest) await this.verifyApiRequest(logger, headers, method, path)
                            
    if(!api) {
      logger.debug('API not found %s', method)
      res.end(this.sendErrorResponse(res,[Errors.message.NOT_FOUND], HTTP.ErrorCode.NOT_FOUND, HTTP.HeaderValue.json))
      return
    }
    
    return api
  }

  public async invokeApi(logger : Logger, api : API, params : any, res : http.ServerResponse) {

    logger.debug('invokeApi %s %s', JSON.stringify(api), params)

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

  public sendNotFoundResponse(res : http.ServerResponse, errArr : Array<string>) {
    res.end(this.sendErrorResponse(res, errArr, HTTP.ErrorCode.NOT_FOUND, HTTP.HeaderValue.json))
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

  private sendErrorResponse(res        : http.ServerResponse,
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
}