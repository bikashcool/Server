const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcryt = require("bcrypt");

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
        if(!(userDetails.resetPasswordExpires > Date.now())){
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