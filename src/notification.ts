import { Logger } from './logger'
import {DatabaseOperations} from './db'
import {Queries} from './queries'
import {executeHttpsRequest} from './https-requests'
import {HTTP} from './http-constants'
import { HTTPMethod } from 'aws-sdk/clients/xray'
import { HTTPHeaders } from 'aws-sdk/clients/waf'

const TYPE       = 'HOME',
      SECTION    = 'WALLET_TRANSACTION',
      PAGE_VIEW  = 'com.affordplan.fragment.walletFragments.WalletDashboardFragment',
      KEY_PREFIX = 'key='

type UrlObj = {
  protocol : string
  hostname : string
  port     : number
  pathname : string
  method   ?: any
  headers  ?: any 
}  

type Config = {
  PROTOCOL : string
  HOST     : string
  PORT     : number
  PATH     : string
  AUTH_KEY : string
}

export class Notification {
  private logger : Logger
  private DB : DatabaseOperations
  private config : Config
  constructor(logger : Logger, db : DatabaseOperations, config : Config) {
    this.logger = logger
    this.DB = db
    this.config = config
  }
  public async sendNotification(userId : string, title : string, message : string) {
    this.logger.debug('sendNotification %s %s %s', userId, title, message)

    const deviceRegistrations = await this.DB.executeQuery(this.DB.format(Queries.getCustomerDeviceToken, [ userId ]))

    if(!deviceRegistrations || !deviceRegistrations.length) {
      this.logger.warn('No registered device found for the user. %s %s', userId, JSON.stringify(deviceRegistrations))
      return
    }


    this.logger.debug('Registered devices found for the user. %s %s', userId, deviceRegistrations.length)

    const urlObj : UrlObj = {
      protocol: this.config.PROTOCOL,
      hostname: this.config.HOST,
      port    : this.config.PORT,
      pathname: this.config.PATH,
      
    },
          options  = urlObj

    options.method  = HTTP.Method.POST
    options.headers = {
      [HTTP.HeaderKey.contentType]   : HTTP.HeaderValue.json,
      [HTTP.HeaderKey.authorization] : KEY_PREFIX + this.config.AUTH_KEY
    }

    const registrationIds = deviceRegistrations.map((reg : any) => reg.token),
          data            = {
                              to               : null,
                              data             : {
                                type          : TYPE,
                                action        : null,
                                validity      : null,
                                message,
                                title,
                                planId        : null,
                                section       : SECTION,
                                pageView      : PAGE_VIEW,
                                image         : null,
                                lotId         : null,
                                transactionId : null,
                              },
                              registration_ids : registrationIds,
                              notification     : {
                                title,
                                body : message
                              }
                            },
          dataStr         = JSON.stringify(data)

    this.logger.debug('FCM request to be sent. %s %s %s %s %s', userId, title, message, JSON.stringify(options), dataStr)
    try {
      await executeHttpsRequest(this.logger, urlObj, options, dataStr)
    } catch(e) {
      this.logger.warn('Error in sending notification to device. %s', e)
    }
  }
}