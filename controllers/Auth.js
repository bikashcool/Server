const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt")

// Sign Up Logic for Regitering User
exports.signUp = async(req, res) => {
    try{
        // retrieve data from the request body
        const {
            firstName, 
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body

        // check whether all the data were present or not
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).send({
                success: false,
                message: "Fill all the fields required",
            })
        }

        // Check if password and confirm password match or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password doesn't match, Please Try Again.",
            })
        }

        // check if user already Exists
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        // find the most recent otp for the email
        const response = await OTP.find({email}).sort({createdAt: -1}).limit(1)
        console.log(response)
        if(response.length === 0){
            // OTP not found for the email
            return res.status(400).json({
                success: false,
                message: "OTP is not valid.",
            })
        }else if(otp !== response[0].otp){
            // invalid otp
            return res.status(400).json({
                success: false,
                message: "OTP is not valid",
            })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)

        // create the additional profile for User
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })
        const user = await User.create({
          firstName,
          lastName,
          email,
          contactNumber,
          password: hashedPassword,
          accountType: accountType,
          approved: approved,
          additionalDetails: profileDetails._id,
          image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}${lastName}`,
        });

        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,
            message: "User cannot be registered. Please Try Again."
        })
    }
}

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
                lowerCaseAlphabets: false,
                specialChars: false,
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

