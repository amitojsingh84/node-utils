// TODO : these should be enums
export const HTTP = {
  HeaderKey          : {
    contentType      : 'content-type',
    requestId        : 'request-id',
    authorization    : 'authorization',
  },
  
  HeaderValue : {
    form     : 'application/x-www-form-urlencoded',
    mutiForm : 'multipart/form-data',
    stream   : 'application/octet-stream',
    json     : 'application/json'
  },

  Method      : {
    PUT    : 'PUT',
    GET    : 'GET',
    POST   : 'POST',
    DELETE : 'DELETE'
  },

  ErrorCode   : {
    OK          : 200,
    NOT_FOUND   : 404,
    BAD_REQUEST : 500
  }
}