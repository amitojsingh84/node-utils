import { Logger }                from './logger'
import { APError}                from './ap-error'
import {Errors}                  from './errors'
import { FileStorageOperations } from './file-storage'
import {RedisOperations} from './redis'
import {Base64Decode}            from 'base64-stream'
import fs from 'fs'
import path from 'path'

const STRING   = 'string',
      NUMBER   = 'number',
      BOOLEAN  = 'boolean',
      TEMP     = 'temp'

const UPLOAD_FILE_OPERATIONS_MAP_NAME = 'payment-service:file-upload-operations'

type Config = {
  FILE_DATA_CHUNK_SIZE : number

}
export class UploadFile {
  private logger :Logger
  private config 
  private fileStorage : FileStorageOperations
  private redis : RedisOperations

  constructor(logger : Logger, config : any, fileStorage : FileStorageOperations, redis : RedisOperations) {
    this.logger = logger
    this.config = config
    this.fileStorage = fileStorage
    this.redis = redis
  }

  /**
   * This method uploads file in parts and then it saves that file to local.
   * @param fileName name of file string.
   * @param totalNoOfChunks total number of chunks number.
   * @param chunkIndex chunk index number.
   * @param fileData chunk data string.
   * @example  To upload a file 'affordplan_logo.png' with total number of chunks 10, use the funtion like
   * 
   * uploadFilePart('affordplan_logo.png', 10, 0, 'Somebase64Data')
   * uploadFilePart('affordplan_logo.png', 10, 1, 'NextChunkAfterSomebase64Data') and so on..
   */
  public async uploadFilePart(fileName : string, totalNoOfChunks : number, chunkIndex : number, fileData : string) {
    this.logger.debug('uploadFilePart %s %s %s', fileName, totalNoOfChunks, chunkIndex)
    
    if(!fileName || typeof fileName !== STRING ) {
      this.logger.error('Invalid or missing fileName. %s %s %s', fileName, totalNoOfChunks, chunkIndex)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.INVALID_PARAMS)
    }

    const filePath   = path.join(process.cwd(), TEMP, fileName),
          fileConfig = await this._checkFileExists(filePath)

    if(!fileData || fileData === '' || typeof fileData !== STRING || (chunkIndex !== 0 && !chunkIndex) 
      || typeof chunkIndex !== NUMBER || !totalNoOfChunks || typeof totalNoOfChunks !== NUMBER 
      || fileData.length > this.config.FILE_DATA_CHUNK_SIZE) {

      this.logger.error('Invalid or missing params. %s %s %s %s',fileName, filePath, totalNoOfChunks, chunkIndex)
      if(fileConfig) await this._deleteFile(filePath)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_UPLOAD_ERROR)
    }

    if(fileConfig && chunkIndex === 0) {
      this.logger.error('File with given fileName already exists. %s %s %s %s', fileName,
                    filePath, totalNoOfChunks, chunkIndex)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_ALREADY_EXISTS)
    }

    try {
      if(fileConfig) await this._addChunkToFile(filePath, totalNoOfChunks, chunkIndex, fileData, fileConfig)
      else           await this._addFileDetails(filePath, totalNoOfChunks, chunkIndex, fileData)
      
    } catch(err) {
      this.logger.error('Error while adding chunk to file or creating new file. %s %s %s %s', fileName, totalNoOfChunks, 
                   chunkIndex, err)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_UPLOAD_ERROR)
    }
  }
  
  /**
   * This method allows you to upload file to storage service.
   * @param fileName file name string.
   * @param bucket bucket name string.
   * @param folderPath folder path string.
   * @param isPublic access permission for file boolean.
   * @returns fileUrl URL where file is stored in storage.
   * @example To upload a file in storage 'aws_bucket/logo/images/affordplan_logo.png' publically
   * 
   * uploadFileToStorage('affordplan_logo.png', 'aws_bucket', 'logo/images', true)
   * // returns the file URL where file is stored in storage.
   */
  public async uploadFileToStorage(fileName : string, bucket : string, folderPath : string, isPublic = true) {
    this.logger.debug('uploadFileToStorage %s %s %s %s', fileName, bucket, folderPath, isPublic)

    if(!fileName || typeof fileName !== STRING ) { 
      this.logger.error('Invalid or missing fileName. %s %s %s %s', fileName, bucket, folderPath, isPublic)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.INVALID_PARAMS)
    }

    const filePath   = path.join(process.cwd(), TEMP, fileName),
          fileConfig = await this._checkFileExists(filePath)

    this.logger.debug('filePath and fileConfig %s %s', filePath, JSON.stringify(fileConfig))

    if(!bucket || !folderPath || typeof bucket !== STRING || typeof folderPath !== STRING 
        || typeof isPublic !== BOOLEAN) {
      this.logger.error('Invalid or missing params for uploadFileToStorage. %s %s %s %s %s',
                    fileName, filePath, bucket, folderPath, isPublic)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.INVALID_PARAMS)
    }
    
    if(!fileConfig) {
      this.logger.error('File does not exists. %s %s %s %s %s %s', fileName, filePath, bucket, folderPath, isPublic,
                   JSON.stringify(fileConfig))
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_NOT_FOUND)
    }

    const totalChunks = fileConfig.totalNoOfChunks,
          chunks      = fileConfig.chunks

    if(totalChunks !== chunks) {
      this.logger.error('Some chunks are missing. %s %s %s %s %s %s %s', fileName, filePath, bucket, folderPath, isPublic,
                   JSON.stringify(chunks), JSON.stringify(fileConfig))
      if(fileConfig) await this._deleteFile(filePath)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_UPLOAD_ERROR)
    }

    try {
      const dataStream      = fs.createReadStream(filePath),
            data            = dataStream.pipe(new Base64Decode()),
            storageFilePath = path.join(folderPath, fileName),
            fileUrl         = await this.fileStorage.uploadFile(bucket, storageFilePath, data, isPublic)
     
      this.logger.debug('bucket, storageFilePath, data, isPublic %s %s %s %s', bucket, storageFilePath, data, isPublic)
     
      if(fileConfig) await this._deleteFile(filePath)
      return fileUrl
    } catch(err) {
      this.logger.error('Error in uploading file to file storage service. %s %s %s %s', bucket, fileName, isPublic, err)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_UPLOAD_ERROR)
    }
  }

  /**
   * Updates the file details in file config.
   */
  // close() {
  //   this.logger.debug('Updating file-upload-config. %s', JSON.stringify(this._fileDetails))
  //   fs.writeFileSync(this._fileDataPath, JSON.stringify(this._fileDetails))
  // }

/*------------------------------------------------------------------------------
  Private Methods
------------------------------------------------------------------------------*/
  
  private async _addChunkToFile(filePath : string, totalNoOfChunks : number, chunkIndex : number, fileData : string, fileConfig : any) {
    this.logger.debug('_addChunkToFile %s %s %s %s', filePath, totalNoOfChunks, chunkIndex, JSON.stringify(fileConfig))

    const totalChunks        = fileConfig.totalNoOfChunks,
          expectedChunkIndex = fileConfig.chunks

    if(totalChunks !== totalNoOfChunks || expectedChunkIndex !== chunkIndex || chunkIndex >= totalNoOfChunks) {
      this.logger.error('Invalid chunkIndex or totalNoOfChunks. %s %s', chunkIndex, totalNoOfChunks)
      if(await this._checkFileExists(filePath)) await this._deleteFile(filePath)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.FILE_UPLOAD_ERROR)
    }

    fileConfig.chunks++

    await this.redis.hset(UPLOAD_FILE_OPERATIONS_MAP_NAME, filePath, JSON.stringify(fileConfig))

    this.logger.debug('Adding data to the file. %s %s %s %s', filePath, totalNoOfChunks, chunkIndex,
                 JSON.stringify(fileConfig))

    fs.appendFileSync(filePath, fileData)

    this.logger.debug('Data added successfully. %s %s %s %s', filePath, totalNoOfChunks, chunkIndex,
                 JSON.stringify(fileConfig))
  }

  private async _addFileDetails(filePath : string, totalNoOfChunks : number, chunkIndex : number, fileData : string) {
    this.logger.debug('_addFileDetails %s %s %s', filePath, totalNoOfChunks, chunkIndex)
  
    if(chunkIndex !== 0) {
      this.logger.error('Invalid chunkIndex. %s', chunkIndex)
      throw new APError(Errors.name.FILE_UPLOAD_ERROR, Errors.message.INVALID_PARAMS)
    }

    const jsonData = {
      fileName : filePath,
      totalNoOfChunks,
      chunks   : 1
    }

    this.logger.debug('Adding details to redis %s %s %s', filePath, totalNoOfChunks, chunkIndex)

    await this.redis.hset(UPLOAD_FILE_OPERATIONS_MAP_NAME, filePath, JSON.stringify(jsonData))

    fs.writeFileSync(filePath, fileData)
    this.logger.debug('Added details successfully %s %s %s', filePath, totalNoOfChunks, chunkIndex)
  }

  private async _checkFileExists(filePath : string) {
    const fileDataExist = await this.redis.hget(UPLOAD_FILE_OPERATIONS_MAP_NAME, filePath)
    
    this.logger.debug('fileDataExists %s', fileDataExist)
    return fs.existsSync(filePath) && JSON.parse(fileDataExist)
  }

  private async _deleteFile(filePath : string) {
    this.logger.debug('_deleteFile %s', filePath)

    await this.redis.hdel(UPLOAD_FILE_OPERATIONS_MAP_NAME, filePath)

    fs.unlinkSync(filePath)

    this.logger.debug('File deleted %s', filePath)
  }
}
