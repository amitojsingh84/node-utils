const HTTP = {
  HeaderKey   : {
    userAgent        : 'user-agent',
    clientSecret     : 'x-client-secret',
    contentType      : 'content-type',
    contentLength    : 'content-length',
    setCookie        : 'set-cookie',
    contentEncoding  : 'content-encoding',
    transferEncoding : 'transfer-encoding',
    location         : 'location',
    accept           : 'accept',
    authorization    : 'authorization',
    token            : 'token',
    accessToken      : 'accesstoken',
    appid            : 'appid',
    agentid          : 'agentid',
    signature        : 'signature',
    timestamp        : 'timestamp',
    requestId        : 'request-id'
  },
  
  HeaderValue : {
    form     : 'application/x-www-form-urlencoded',
    mutiForm : 'multipart/form-data',
    stream   : 'application/octet-stream',
    json     : 'application/json',
    gzip     : 'gzip',
    deflate  : 'deflate',
    identity : 'identity',
    chunked  : 'chunked'
  },

  Protocol    : {
    protocolHttp  : 'http:',
    protocolHttps : 'https:'
  },

  Method      : {
    PUT    : 'PUT',
    GET    : 'GET',
    POST   : 'POST',
    DELETE : 'DELETE'
  },

  Constants   : {
    namespaceName    : 'My Request',
    requestId        : 'requestId',
    defaultRequestId : '---'
  }
}

export { HTTP }