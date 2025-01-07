const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();


// Sign Up Logic for Registering User
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

// Log in logic for authenticating Users
exports.login = async (req, res) => {
    try{
        // extract gmail and password from the body
        const {email, password} = req.body

        // check if email or password is missing
        if(!email || !password){
            // return 400 bad request status code with error message
            return res.status(400).json({
                success: false,
                message: `Fill all the required Fields`,
            })
        }

        // Find user with provided email
        const user = await User.findOne({email}).populate("additionalDetails")

        // if user not found with provided email
        if(!user){
            return res.status(401).json({
                success: false,
                message: `User is not registered, Please Sign up to Continue`
            })
        }

        // Generate JWT token and Compare Password
        if(await bcrypt.compare(password, user.password)){
            const token = jwt.sign(
                {email: user.email, id: user._id, role: user.role},
                process.env.JWT_secret,
                {
                    expiresIn: "24h"
                }
            );

            // save token to user document in database
            user.token = token;
            user.password = undefined;

            // set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            })
        }else{
            return res.status(401).json({
                success: false,
                message: `password is incorrect`,
            })
        }
    }catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: `Login Failure, Please try again`,
        })
    }
}

// Logic for Changing Password
exports.changePassword = async (req, res) => {
    try{
        // get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // get old and new password from req.body
        const {oldPassword, newPassword} = req.body;

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password,
        ) 

        // if password doesn't match, send a bad request
        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            }) 
        }

        // Update Password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updateUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password: encryptedPassword},
            {new: true},
        )

        // send notification of email
        try{
            const emailResponse = await mailSender(
                updateUserDetails.email,
                "Password for your account is been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent Successfully", emailResponse.response);
        }catch(error){
            console.error("Error occured while sending email: ",error);
            return res.status(500).json({
                success: false,
                message: "Error occured while sending email",
                error: error.message,
            })
        }

        // return success response
        return res.status(200).json({
            success: true,
            message: "Password updated Successfully"
        })
    }catch(error){
        //If any error occurs while updating the password, return a 500 (Internal server error) error
        console.error("Error occured while updating password: ", error);
        return res.status(500).json({
            success: false,
            message: "Error Occured while updating password",
            error: error.message,
        })
    }
}