const User = require("../models/User");

// Send OTP for Email Verification
exports.sendOTP = async(req, res) => {
    try{
        const {email} = req.body;

        // check user if Already registered
        const checkUserPresent = await User.findOne({email})
        
        // if user found with provided email
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: `Email Already Registered`,
            })
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        const result = OTP.findOne({otp: otp})
        console.log("Result is Generate otp Func")
        console.log("OTP", otp)
        console.log("Result", result)
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            })
        }
        const otpPayload = {email, otp}
        const otpBody = await OTP.create(otpPayload)
        console.log("OTP BODY", otpBody)
        res.status(200).json({
            success: true,
            message: `OTP sent succesfully`, 
            otp,
        })
    }catch(error){
        console.log(error.message)
        return res.status(500).json({
            success:false,
            error: error.message
        })
    }
}