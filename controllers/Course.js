const Course = require("../models/Course");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// handler function to create a new course
exports.createCourse = async (req, res) => {
    try{
        // fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        // get thumbnail from request file
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails);
        // todo verification

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor details not found",
            });
        }

        // check if given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success: false,
                message: "Tag Details not found",
            });
        }

        // Upload image top cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price, 
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        // add the new course to user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses : newCourse._id,
                }
            },
            {new: true},
        );

        // tag schema

        // return response
        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse,
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create Course",
            error: error.message,
        })
    }
};

// function to get all the course list
exports.getAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find(
            {status: "Published"},
            {
                courseName: true,
                thumbnail: true,
                price: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        ).populate("instructor").exec()

        return res.status(200).json({
            success: true,
            message: "Data for all courses Fetched Successfully",
            data: allCourses,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot Fetch course data',
            error: error.message,
        })
    }
}

exports.getCourseDetails = async (req, res) => {
    try{
        // get course id
        const {courseId} = req.body;

        // find course details
        const courseDetails = await Course.find(
            {_id: courseId}
        ).populate(
            {
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            }
        )
        .populate("category")
        .populate("ratingAndreviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // response
        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            data: courseDetails,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "error occured while fetching course details",
        });
    }
}