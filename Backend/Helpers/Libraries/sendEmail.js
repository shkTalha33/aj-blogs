const nodemailer = require('nodemailer')

const sendEmail = async (mailOptions) =>{

    const {SMTP_HOST,SMTP_PORT,EMAIL_USERNAME,EMAIL_PASS}=process.env

    console.log(SMTP_HOST,SMTP_PORT,EMAIL_USERNAME,EMAIL_PASS);

    let transporter = nodemailer.createTransport({

        service: 'gmail',
        host : SMTP_HOST ,
        port : SMTP_PORT  ,
        secure: false,
        auth :{
            user : EMAIL_USERNAME ,
            pass : EMAIL_PASS
        } ,
         tls: {rejectUnauthorized: false}
       
    })

    let info = await transporter.sendMail(mailOptions) ; 

    console.log(`Message send : ${info.messageId}`)

}


module.exports = sendEmail


