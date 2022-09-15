const EmailMessages = {
  FINANCIAL_CONFIGURATION_CHANGE : `Hello Team, <br>Financial configuration regarding <b><operationName></b> for 
                                   <b><hospitalName></b> has been changed by <b><userName>(<userEmail>)</b><br><br>`,

  LAB_TEST_CUSTOMER              : `<b>Quick. Safe. Accurate.</b>\nYour lab test is just a call away with 
                                   Affordplan Swasth, get your lab test done at <hospitalName>.`,

  LAB_TEST_HOSPITAL              : `<b>The Customer has initiated a lab test booking through affordplan. Kindly check 
                                   your dashboard https://bit.ly/3IKnmUb. For any query, 
                                   call Affordplan at +919250050501.</b>
                                   <br>WSN: <walletSerial><br>Customer Name: <customerName><br>Mobile Number: <mobile>`,

  LAB_TEST_OPS                   : `<b>The Customer has initiated a lab test booking through affordplan. Kindly check 
                                   your dashboard https://bit.ly/3M3eMT4.</b>
                                   <br>WSN: <walletSerial><br>Customer Name: <customerName>
                                   <br>Mobile Number: <mobile><br>Hospital Name: <hospitalName>`,
  
  ACTIVE_EMPLOYEE_LIST           : '<b>PFA the list of active employees.</b>'
}

module.exports = EmailMessages