import { Logger } from './logger'
import * as http  from 'http'

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
  
  registerApi(logger : Logger, method : string, path : string, fn : (params : any) => Promise<any>) {
    logger.debug('registerApi %s %s %s', method, path, fn)

    const api : API = { method, path, fn }
    this.registry.push(api)
  }

  async callApi(logger : Logger, method : string, path : string, params : any, res : http.ServerResponse) {

    logger.debug('callApi %s %s %s', method, path, params)

    const api = this.registry.find((api : API) => api.method === method && api.path === path)

    logger.debug('Api %s %s %s', method, path, api)

    if(!api) {
      logger.debug('API not found %s %s', method, path)
      return res.end(this.sendErrorResponse(res, 'Not found'))
    }

    let resp : any = {}

    if(api.method === 'GET') {
      resp = await api.fn(params)
    } else if(api.method === 'POST') {
      resp = await api.fn(JSON.parse(params))
    }

    return res.end(this.sendSuccessResponse(res, resp))
  }

  sendSuccessResponse(res : http.ServerResponse, response : any) {
    res.writeHead(200, {'Content-Type': 'application/json'})
    const data = {
      success : OPERATION_SUCCESS,
      response
    }

    const resp = { data }
    return JSON.stringify(resp)
  }

  sendErrorResponse(res : http.ServerResponse, errMessage : string) {
    res.writeHead(404, {'Content-Type': 'application/json'})
    const data = {
      error              : VALIDATION_ERROR,
      [VALIDATION_ERROR] : errMessage 
    }

    const resp = { data }
    return JSON.stringify(resp)
  }
}