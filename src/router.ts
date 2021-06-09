import * as http  from 'http'
import { Logger } from './logger'
import { HTTP }   from './http-constatnts'

export type API = {
  fn     : (params : any) => Promise<any>
  path   : string
  method : string
}
export type Registry = Array<API>

const OPERATION_SUCCESS : string = 'OperationSuccess',
      VALIDATION_ERROR  : string = 'ValidationError'

export class Router {

  private registry : Registry = []
  // private api : API = null as any

  registerApi(logger : Logger, method : string, path : string, fn : (params : any) => Promise<any>) {
    logger.debug('registerApi %s %s %s', method, path, fn)
    console.log(fn)
    const api : API = { method, path, fn }
    // this.api = api
    this.registry.push(api)
  }

 verifyRequest(logger : Logger, method : string, path : string) {
    logger.debug('verifyRequest %s %s', method, path)

    const api = this.registry.find((api : API) => api.method === method && api.path === path)

    logger.debug('Api %s %s', method, path)

    if(!api) {
      logger.debug('API not found %s', method)
      return false
    }

    return true
  }

  async callApi(logger : Logger, method : string, path : string, params : any, res : http.ServerResponse) {

    const api = this.registry.find((api : API) => api.method === method && api.path === path)
    // const api = this.api
    if(!api) return
    
    logger.debug('callApi %s %s', api, params)
    try {
      const resp = await api.fn(params)
      logger.debug('Sending success response %s', resp)

      return res.end(this.sendSuccessResponse(res, resp, 200, HTTP.HeaderValue.json))
    } catch(err) {
      logger.debug('Sending error response %s', err)
      return res.end(this.sendErrorResponse(res, err, 404, HTTP.HeaderValue.json))
    }
  }

  public sendSuccessResponse(res : http.ServerResponse, response : any, statusCode : number, contentType : string) {
    res.writeHead(statusCode, { [HTTP.HeaderKey.contentType] : contentType })
    const data = {
      success : OPERATION_SUCCESS,
      response
    }

    const resp = { data }
    return JSON.stringify(resp)
  }

  public sendErrorResponse(res : http.ServerResponse, errMessage : string, statusCode : number, contentType : string) {
    res.writeHead(statusCode, { [HTTP.HeaderKey.contentType] : contentType })
    const data = {
      error              : VALIDATION_ERROR,
      [VALIDATION_ERROR] : errMessage 
    }

    const resp = { data }
    return JSON.stringify(resp)
  }
}