import { Logger }  from './logger'
import { APError } from './ap-error'
import { Errors }  from './errors'
import * as xlsx   from 'xlsx'

const BUFFER = 'buffer',
      XLSX   = 'xlsx'

class ExcelUtility {

  /**
   * Convert array of objects into buffer data of sheet.
   * @param Array of objects(Json Data)
   * @returns buffer data for the spreadsheet 
   */
  
  convertJsonToExcel(logger : Logger, jsonData : any) : string { 
    logger.debug('convertJsonToExcel. %s', JSON.stringify(jsonData))

    try {
      const workbook   = xlsx.utils.book_new(),
            sheetnames = Object.keys(jsonData)

      sheetnames.forEach((sheetname) => {
        const dataSheet = xlsx.utils.json_to_sheet(jsonData[sheetname]) 
        xlsx.utils.book_append_sheet(workbook, dataSheet, sheetname)
      })
                 
      const bufferData = xlsx.write(workbook, { type: BUFFER, bookType: XLSX })

      return bufferData
    } catch(e) {
      logger.debug('Error occured %s', JSON.stringify(e))
      throw new APError(Errors.name.ERROR_IN_CONVERTING_JSON_TO_EXCEL, Errors.message.ERROR_IN_CONVERTING_JSON_TO_EXCEL)
    }
  }
}

const Excel = new ExcelUtility()

module.exports = Excel
