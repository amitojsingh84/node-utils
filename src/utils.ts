import * as stream from 'stream'

/**
 * 
 * @param stream Readable stream
 * @returns Readable stream converted into string
 */
export async function streamToString(stream : stream.Readable) : Promise<string> {
  return await new Promise((resolve, reject) => {
    let data = ''
    stream.on('data', (chunk) => {
      data += chunk.toString()
    }).on('end', () => {
      resolve(data)
    }).on('error', (err) => {
      reject(err)
    })
  })
}