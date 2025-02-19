const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// logic for updating a profile
exports.updateProfile = async (req, res) => {
    try{
        const {
            // firstName = "",
            // lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber,
            // gender = "",
        } = req.body;

        const id = req.user.id;

        const userDetails = await User.findById(id);
        const profile = await Profile.findById(userDetails.additionalDetails);

        // Update the profile field
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber
        // profile.gender = gender;

        // save the updated Profile
        await profile.save()

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            profile,
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try{
        const id = req.user.id;
        console.log(id)
        const user= await User.findById({_id: id});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // delete associated profile with user
        await Profile.findByIdAndDelete({
            _id: user.additionalDetails
        })
        for(const courseId of user.courses){
            await Course.findByIdAndUpdate(
                courseId,
                {$pull: {studentsEnrolled: id}},
                {new: true},
            )
        }

        await User.findByIdAndDelete({_id: id})
        return res.status(200).json({
            success: true,
            message: "User deleted Successfully",
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be deleted successfully",
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()

        console.log(userDetails);
        res.status(200).json({
            success: true,
            message: "User Data fetched Successfully",
            data: userDetails,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateDisplayPicture = async(req, res) => {
    try{
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME, 1000, 1000
        )
        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
            {_id: userId},
            {image: image.secure_url},
            {new: true}
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile
        })
    }catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try{
        const userId = req.user.id
        const userDetails = await User.findOne({
            _id: userId,
        })
        .populate("courses")
        .exec()

        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}