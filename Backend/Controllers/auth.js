const asyncErrorWrapper = require("express-async-handler")
const User = require("../Models/user");
const CustomError = require("../Helpers/error/CustomError");
const { sendToken } = require("../Helpers/auth/tokenHelpers");
const sendEmail = require("../Helpers/Libraries/sendEmail");
const { validateUserInput,comparePassword } = require("../Helpers/input/inputHelpers");

const getPrivateData = asyncErrorWrapper((req,res,next) =>{

    return res.status(200).json({
        success:true ,
        message : "You got access to the private data in this route ",
        user : req.user

    })

})

const register = asyncErrorWrapper (async  (req,res,next) => {

    const { username,email , password} = req.body  ;
    
    const newUser = await User.create({
        username,
        email,
        password
    })
    
    sendToken(newUser ,201,res)
  

})

const login  = asyncErrorWrapper (async(req,res,next) => {

    const {email,password} = req.body 

    if(!validateUserInput(email,password)) {

        return next(new CustomError("Please check your inputs",400))
    }

    const user = await User.findOne({email}).select("+password")

    if(!user) {
        
        return next(new CustomError("Invalid credentials",404))
    }

    if(!comparePassword(password,user.password)){
        return next(new CustomError("Please chech your credentails",404))
    }

    sendToken(user ,200,res)  ;
    
})




const forgotpassword  = asyncErrorWrapper( async (req,res,next) => {
    const {URI,EMAIL_USERNAME} = process.env ; 

    const resetEmail = req.body.email  ;

    const user = await User.findOne({email : resetEmail})

    if(!user ) {
        return next(new CustomError( "There is no user with that email",400))
    }

    const resetPasswordToken = user.getResetPasswordTokenFromUser();

    await user.save()  ;

    const resetPasswordUrl = `${URI}/resetpassword?resetPasswordToken=${resetPasswordToken}`

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
        }
        .content a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AJ Blogs</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi there,</p>
            <p>We received a request to reset your password for your AJ Blogs account. Click the button below to reset your password:</p>
            <a href="${resetPasswordUrl}">Reset Your Password</a>
            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
            <p>Thanks,<br>The AJ Blogs Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AJ Blogs. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

    try {

        sendEmail({
            from: EMAIL_USERNAME,
            to: resetEmail, 
            subject: " ✔ Reset Your Password  ✔", 
            html: emailTemplate
        })

        return res.status(200)
        .json({
            success: true,
            message: "Email Send"
        })

    }

    catch(error ) {

        user.resetPasswordToken = undefined ;
        user.resetPasswordExpire = undefined  ;

        await user.save();
   
        return next(new CustomError('Email could not be send ', 500))
    }



})


const resetpassword  =asyncErrorWrapper(  async (req,res,next) => {

    const newPassword = req.body.newPassword || req.body.password

    const {resetPasswordToken} = req.query

    if(!resetPasswordToken) {

        return next(new CustomError("Please provide a valid token ",400))
    }

    const user = await User.findOne({

        resetPasswordToken :resetPasswordToken ,
        resetPasswordExpire : { $gt: Date.now() }

    })
    
    if(!user) {
        return next(new CustomError("Invalid token or Session Expired" ,400))
    }

    console.log("works");

    user.password = newPassword ; 

    user.resetPasswordToken = undefined 
    user.resetPasswordExpire = undefined

    await user.save() ; 

    return res.status(200).json({
        success :true ,
        message : "Reset Password access successfull"
    })

})


module.exports ={
    register,
    login,
    resetpassword,
    forgotpassword,
    getPrivateData
}