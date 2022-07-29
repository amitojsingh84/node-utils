import { Logger } from './logger'
import { APError} from './ap-error'
import { Errors}  from './errors'
import puppeteer from 'puppeteer'

export class PdfOperations {
  private logger : Logger
  constructor(logger : Logger) {
    this.logger = logger
  }
  async generatePdf(htmlContent = '') {
    this.logger.debug('Generating new pdf from html content. %s...', htmlContent)

    try {
      const browser = await puppeteer.launch(),
            page    = await browser.newPage()
    
      await page.setContent(htmlContent)
      const pdfBuffer = await page.pdf()
    
      await page.close()
      await browser.close()

      this.logger.debug('Pdf generated.')
    
      return pdfBuffer
    } catch(e) {
      this.logger.error('Error in generating pdf. %s %s', htmlContent, e)
      throw new APError(Errors.name.PDF_GENERATION_ERROR, Errors.message.PDF_GENERATION_ERROR)
    }
  }
}