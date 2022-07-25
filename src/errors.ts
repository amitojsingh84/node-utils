// TODO : enums
export const Errors = {
  name : {
    INVALID_REQUEST                   : 'INVALID_REQUEST',
    INVALID_METHOD                    : 'INVALID_METHOD',
    NOT_FOUND                         : 'NOT_FOUND',
    ERROR_IN_CONVERTING_JSON_TO_EXCEL : 'ERROR_IN_CONVERTING_JSON_TO_EXCEL',
    RECIEVER_EMAILS_REQUIRED          : 'RECIEVER_EMAILS_REQUIRED',
    EMAIL_SUBJECT_REQUIRED            : 'EMAIL_SUBJECT_REQUIRED', 
    EMAIL_BODY_REQUIRED               : 'EMAIL_BODY_REQUIRED',    
    EMAIL_SENDING_FAILURE             : 'EMAIL_SENDING_FAILURE',
    DB_NOT_INITIALIZED                : 'DB_NOT_INITIALIZED',
    DB_ERROR                          : 'DB_ERROR',
  },

  message : {
    INVALID_REQUEST                   : 'Invalid request',
    INVALID_METHOD                    : 'Invalid method',
    NOT_FOUND                         : 'Not found',
    ERROR_IN_CONVERTING_JSON_TO_EXCEL : 'Error in converting json to excel.',
    RECIEVER_EMAILS_REQUIRED          : 'Reciever emails is required',
    EMAIL_SUBJECT_REQUIRED            : 'Email subject is required for email.',
    EMAIL_BODY_REQUIRED               : 'Email body is required for email.',
    EMAIL_SENDING_FAILURE             : 'Error occur while sending email.',
    DB_NOT_INITIALIZED                : 'DB is not initialized.',
    DB_ERROR                          : 'Error occurred in executing DB query.',
    DB_DOWN                           : 'DB is down.',
  }
}