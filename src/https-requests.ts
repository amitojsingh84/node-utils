import { Logger }     from './logger'
import * as http      from 'http'
import * as https     from 'https'
import * as urlModule from 'url'

/**
 * Executes http(s) request.
 * @param urlObj url.URL object
 * @param options http(s).reqOptions object
 * @param data JSON stringified data. Pass query params in url.
 */
export async function executeHttpsRequest(logger: Logger, urlObj : any, options : any, data : string) {
  
  logger.debug('executeHttpsRequest request %s %s %s', JSON.stringify(urlObj), JSON.stringify(options), data)

  const pr = new Promise((resolve, reject) => {

    const httpModule = urlObj.protocol === 'https:' ? https : http,
          url        = urlModule.format(urlObj),
          req        = httpModule.request(url, options)

    req.on('error', (err) => {
      return reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
    })

    req.on('response', (res) => {

      let body : string = ''

      res.on('data', (d) => {
        body = body + d
      })

      res.on('end', () => {
        return resolve(body)
      })
    })

    req.end(data)
  })

  const resp : string = await pr as string
  logger.debug('executeHttpsRequest response %s %s %s %s', JSON.stringify(urlObj), JSON.stringify(options), data, resp)

  return resp
}

