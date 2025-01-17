const Profile = require("../models/Profile");
const User = require("../models/User");

// logic for updating a profile
exports.updateProfile = async (req, res) => {
    try{
        const {
            firstName = "",
            lastName = "",
            dataOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body;

        const id = req.user.id;

        const userDetails = await User.findById(id);
        const profile = await Profile.findById(userDetails.additionalDetails);

        const user = await User.findByIdAndUpdate(id, {
            firstName, lastName,
        })
        await user.save()

        // Update the profile field
        profile.dataOfBirth = dataOfBirth
        profile.about = about
        profile.contactNumber = contactNumber
        profile.gender = gender

        await profile.save()

        // find the updated user details
        const updatedUserDetails = await User.findbyId(id)
        .populate("additionalDetails")
        .exec()

        return res.status(200).json({
            success: false,
            message: "Profile Updated Successfully",
            updatedUserDetails
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
        const user= await User.findbyId({_id: id});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // delete associated profile with user
        await Profile.findByIdAndDelete({
            _id: new mongoose.Types.ObjectId(user.additionalDetails),
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
            success: false,
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