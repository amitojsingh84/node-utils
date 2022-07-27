import { Logger } from './logger'
import { APError } from './ap-error'
import * as AWS from 'aws-sdk'
import * as stream from 'stream'
import { Errors } from './errors'

const PRIVATE: string = 'private',
  PUBLIC_READ: string = 'public-read',
  STRING_TYPE: string = 'string',
  BOOLEAN_TYPE: string = 'boolean'

class FileStorageOperations {

  _s3: AWS.S3
  logger: Logger
  ACCOUNT_ID: string

  constructor(ACCESS_KEY_ID: string, SECRET_ACCESS_KEY: string, ACCOUNT_ID: string) {
    this._s3 = new AWS.S3({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY
    })
    this.logger = new Logger('./logs', 'debug')
    this.ACCOUNT_ID = ACCOUNT_ID
  }

  /**
   * To get the list of files in bucket.
   * @param bucket bucket name string 
   * @returns list of files in bucket Array<string>
   */
  async getFileList(bucket: any | undefined) {
    if (!bucket || typeof bucket !== STRING_TYPE) {
      this.logger.debug('Invalid or missing params for getFileList. %s', bucket)
      throw new APError(Errors.name.INVALID_PARAMS, Errors.name.INVALID_PARAMS)
    }

    this.logger.debug('Getting file list. %s', bucket)

    const params: Object = {
      Bucket: bucket,
      ExpectedBucketOwner: this.ACCOUNT_ID
    }
  }

  /**
   * To get data of file from bucket.
   * @param bucket bucket name string
   * @param filePath path of file string
   * @returns data of file from bucket Buffer
   */
  async getFile(bucket: string, filePath: string) {

    this.logger.debug('Fetching file. %s %s', bucket, filePath)

    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucket,
      Key: filePath
    }

    try {
      const fileData = await this._getFileFromStorage(params)

      this.logger.debug('File fetched. %s %s', bucket, filePath)
      return fileData

    } catch (err) {
      this.logger.error('Error in getting data from file in storage service. %s %s', bucket, filePath, err)
      throw new APError(Errors.name.FILE_STORAGE_ERROR, Errors.message.FILE_STORAGE_ERROR)
    }
  }

  /**
   * Uploads file to file storage service
   * @param bucket bucket name string
   * @param filePath path of file string
   * @param data data to be saved in file Buffer | ReadableStream
   * @param isPublic access permission for file boolean
   * @returns file url of file in bucket string
   */
  async uploadFile(bucket: string, filePath: string, data: stream.Readable | Buffer, isPublic: boolean) {

    if (!isPublic) {
      this.logger.debug('Invalid params for uploadFile. %s %s %s', bucket, filePath, isPublic)
      throw new APError(Errors.name.INVALID_PARAMS, Errors.name.INVALID_PARAMS)
    }

    this.logger.debug('Uploading file. %s %s %s', bucket, filePath, isPublic)

    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucket,
      Key: filePath,
      Body: data,
      ACL: isPublic ? PUBLIC_READ : PRIVATE
    }

    try {
      const fileUrl = await this._uploadToStorage(params)

      this.logger.debug('File saved. %s %s %s %s', bucket, filePath, isPublic, fileUrl)
      return fileUrl

    } catch (err) {
      this.logger.error('Error in uploading file to file storage service. %s %s %s %s', bucket, filePath, isPublic, err)
      throw new APError(Errors.name.FILE_STORAGE_ERROR, Errors.message.FILE_STORAGE_ERROR)
    }
  }

  /**
   * Deletes file from bucket
   * @param bucket bucket name string
   * @param filePath path of file string
   */
  async deleteFile(bucket: string, filePath: string) {

    this.logger.debug('Deleting file. %s %s', bucket, filePath)

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: bucket,
      Key: filePath
    }

    try {
      await this._deleteFileFromStorage(params)
      this.logger.debug('File deleted. %s %s', bucket, filePath)

    } catch (err) {
      this.logger.error('Error in deleting file from storage service. %s %s', bucket, filePath, err)
      throw new APError(Errors.name.FILE_STORAGE_ERROR, Errors.message.FILE_STORAGE_ERROR)
    }
  }

  async readFile(bucket: string, filePath: string) {
    this.logger.debug('readFile. %s %s', bucket, filePath)

    this.logger.debug('Fetching file. %s %s', bucket, filePath)

    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucket,
      Key: filePath
    }

    try {
      const fileStream = await this._readFileFromStorageUsingStreams(params)

      this.logger.debug('File fetched. %s %s', bucket, filePath)

      this.logger.debug('fileData %s', fileStream)

      return fileStream

    } catch (err) {
      this.logger.error('Error in getting data from file in storage service. %s %s', bucket, filePath, err)
      throw new APError(Errors.name.FILE_STORAGE_ERROR, Errors.message.FILE_STORAGE_ERROR)
    }

  }

  /*------------------------------------------------------------------------------
    Private Methods
  ------------------------------------------------------------------------------*/

  async _getFileListFromStorage(params: AWS.S3.ListObjectsRequest) {

    const data: AWS.S3.ListObjectsOutput = await new Promise((resolve, reject) => {
      this._s3.listObjects(params, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    // have to make any type becoz it can be undefined too
    const contents: any = data.Contents,
      files = contents.map((content: any) => content.Key)

    return files
  }

  async _getFileFromStorage(params: AWS.S3.GetObjectRequest) {
    return await new Promise((resolve, reject) => {
      this._s3.getObject(params, (err, data) => {
        if (err) reject(err)
        else resolve(data.Body)
      })
    })
  }

  async _uploadToStorage(params: AWS.S3.PutObjectRequest) {
    return await new Promise((resolve, reject) => {
      this._s3.upload(params, (err, data) => {
        if (err) reject(err)
        else resolve(data.Location)
      })
    })
  }

  async _deleteFileFromStorage(params: AWS.S3.DeleteObjectRequest) {
    return await new Promise((resolve, reject) => {
      this._s3.deleteObject(params, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async _readFileFromStorageUsingStreams(params: AWS.S3.GetObjectRequest): Promise<stream.Readable> {
    this.logger.debug('In _readFileFromStorageUsingStreams %s', JSON.stringify(params))

    const stream: stream.Readable = this._s3.getObject(params).createReadStream()

    stream.on('data', (data) => {
      this.logger.debug('stream data')
    })

    stream.on('end', () => {
      this.logger.debug('stream end')
    })

    return stream
  }


}      