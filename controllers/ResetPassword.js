const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcryt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
    try{

        // get email from reqeust body
        const email = req.body.email;
        const user = await User.findOne({email: email});
        
        // user validation
        if(!user){
            return res.json({
                success: false,
                message: `This Email: ${email} is not registered with us, Enter a valid Email`,
            });
        }

        // generate token
        const token = crypto.randomBytes(20).toString("hex");
        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            }
        );
        console.log("details", updatedDetails);

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // sending mail containing url
        await mailSender(
            email,
            "Password Reset", 
            `Your Link for email Verification is ${url}. Please click this url to reset your password`,
        );

        // return response
        res.json({
            success: true,
            message: "Email sent successfully, please Check your email to Continue Further",
        });
    }catch(error){
        return res.json({
            error: error.message,
            success: false,
            message: `Some error in sending the reset message`,
        });
    }
};


exports.resetPassword = async (req, res) => {
    try{
        // data fetch
        const {password, confirmPassword, token} = req.body;

        // validation
        if(confirmPassword !== password){
            return res.json({
                success: false,
                message: "Password and confirm Password doesn't match",
            })
        }

        // get user Detail from db using token
        const userDetails = await User.findOne({token: token});
        // if invalid token
        if(!userDetails){
            return res.json({
                success: false,
                message: "Token is invalid",
            })
        }

        // Token expiry check
        if(!(userDetails.resetPasswordExpires < Date.now())){
            return res.status(403).json({
                success: false,
                message: `Token is expired, please Regenerate the Token`,
            });
        }

        // hash Password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // password Update
        await User.findOneAndUpdate(
            {token: token},
            {password: encryptedPassword},
            {new : true},
        );
        res.json({
            success: true,
            message: `Password reset Successfull`,
        });
    }catch(error){
        return res.json({
            error: error.message,
            success: false,
            message: `Some error in updating the passsword`,
        });
    }
};