import * as http  from 'http'
import { Logger } from './logger'
import { HTTP }   from './http-constatnts'

export type API = {
  fn     : (logger : Logger, params : any) => Promise<any>
  path   : string
  method : string
}
export type Registry = Array<API>

const OPERATION_SUCCESS : string = 'OperationSuccess',
      VALIDATION_ERROR  : string = 'ValidationError'

export class Router {

  private registry : Registry = []

  registerApi(logger : Logger, method : string, path : string, fn : (logger : Logger, params : any) => Promise<any>) {
    logger.debug('registerApi %s %s %s', method, path, fn)
    
    const api : API = { method, path, fn }
    this.registry.push(api)
  }

  // TODO : async
  verifyRequest(logger : Logger, method : string, path : string) : API | undefined {
    logger.debug('verifyRequest %s %s', method, path)

    const api = this.registry.find((api : API) => api.method === method && api.path === path)

    logger.debug('Api %s %s', method, path)

    // TODO : service should be able to verify request

    if(!api) logger.debug('API not found %s', method) // TODO : send error response (404)
    
    return api
  }

  async callApi(logger : Logger, api : API, params : any, res : http.ServerResponse) {

    logger.debug('callApi %s %s', api, params)

    try {
      // TODO : call verification function (if present)

      const resp = await api.fn(logger, params)
      logger.debug('Sending success response %s', resp)

      return res.end(this.sendSuccessResponse(res, resp, HTTP.ErrorCode.OK, HTTP.HeaderValue.json))
    } catch(err) {
      logger.debug('Sending error response %s', err)
      return res.end(this.sendErrorResponse(res, err, HTTP.ErrorCode.BAD_GATEWAY, HTTP.HeaderValue.json)) // 400
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