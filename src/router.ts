

export type API = {
  fn     : (params : any) => Promise<any>
  path   : string
  method : string
}
export type Registry = Array<API>

export class Router {

  private registry : Registry = []
  private routes : Array<{url : string, callback : Function}>

  constructor() {
    this.routes = []
  }

  // TODO : create logger first then pass the logger to log
  registerApi(logger, method : string, path : string, fn : (params : any) => Promise<any>) {
    const api : API = { method, path, fn }
    this.registry.push(api)
  }

  add(url : string, callback : Function) {
    const route = { url, callback }
    this.routes.push(route)
  }

  async callApi(logger, method : string, path : string, params : any, res) {
    // find the api and call its fn

    const api = this.registry.find((api : API) => api.method === method && api.path === path)

    if(!api) return 'Error 404'

    const resp = await api.fn(params)

    return res.whatever
  }

  async handleApiPath(url : string) : Promise<{url : string, callback : Function}> {
    return await new Promise((resolve, reject) => {
      const route = this.routes.find((route : {url : string, callback : Function}) => route.url === url)
      if(route) resolve(route)
      else      reject('Not Found')
    })
  }
}

