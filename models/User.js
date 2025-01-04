// Import the Mongoose library
const mongoose = require("mongoose");

// define the user schema using the mongoose Schema constructor
const userSchema = new mongoose.Schema(
    {
        // define the name field with type String, required and trimmed
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        // Define password field with type string and required
        password: {
            type: String,
            required: true,
        },
        // Define the roles field with type String and enum values of "Admin", "Student", or "Visitor"
        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
        approved: {
            type: Boolean,
            default: true,
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Profile",
        },
        courses: [  {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",  
            },
        ],
        token: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        image: {
            type: String,
            required: true,
        },
        courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "courseProgress"
            }
        ],
    },
);

module.exports = mongoose.model("User", userSchema);