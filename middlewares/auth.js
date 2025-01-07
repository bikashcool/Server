const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
    try{
        // Extracting jwt from request cookies, body and header
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer", "");

        // if jwt is missing, return Unauthorized response
        if(!token){
            return res.status(401).json({
                success: false,
                message: `Token Missing`,
            });
        }

        try{
            // verify the jwt using the secret key stored in env variable
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            // storing the decoded jwt payload in the request object for further user
            req.user = decode;
        }catch(error){
            // if JWT verification fails, return 401 Unauthorized response
            return res.status(401).json({
                success: false,
                message: "token is invalid",
            });
        }

        // if jwt is valid, move on to the next middleware or request handler
        next();
    }catch(error){
        // if there is an error while authentication process
        return res.status(401).json({
            success: false,
            message: `something went wrong while validating the token`,
        });
    }
};

exports.isStudent = async (req, res, next) => {
    try{
        const userDetails = await User.findOne({
            email: req.user.email,
        });

        if(userDetails.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: `This is protected route for Student`,
            });
        }
        next();
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `User role can't be verified`,
        });
    }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({
      email: req.user.email,
    });

    if (userDetails.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: `This is protected route for Admin`,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `User role can't be verified`,
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({
      email: req.user.email,
    });

    if (userDetails.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: `This is protected route for Instructor`,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `User role can't be verified`,
    });
  }
};