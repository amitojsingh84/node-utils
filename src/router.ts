

export class Router {

  private routes : Array<{url : string, callback : Function}>

  constructor() {
    this.routes = []
  }

  add(url : string, callback : Function) {
    const route = { url, callback }
    this.routes.push(route)
  }

  async handleApiPath(url : string | undefined) : Promise<any> {
    return await new Promise((resolve, reject) => {
      const route = this.routes.find((route : any) => route.url === url)
      if(route) resolve(route)
      else      reject('Not Found')
    })
  }
}

