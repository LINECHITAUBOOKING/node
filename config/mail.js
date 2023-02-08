// 導入dotenv 使用 .env 檔案中的設定值 process.env
require('dotenv').config()

const nodemailer = require('nodemailer')

let transport

transport = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  //create a .env file and define the process.env variables with your credentials.
  auth: {
    user: process.env.SMTP_TO_EMAIL,
    pass: process.env.SMTP_TO_PASSWORD,
  },
}

// call the transport function
const transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
  if (error) {
    //if error happened code ends here
    console.error(error)
  } else {
    //this means success
    console.log('Ready to send mail!')
  }
})

module.exports = { transporter }
