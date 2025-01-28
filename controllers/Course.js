const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// handler function to create a new course
exports.createCourse = async (req, res) => {
    try{
        // fetch data
        let {
            courseName,
            courseDescription, 
            whatYouWillLearn, 
            price, 
            tag,
            category,
            status,
            instructions,
        } = req.body;

        // get thumbnail from request file
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(
            !courseName || 
            !courseDescription || 
            !whatYouWillLearn || 
            !price || 
            !tag || 
            !thumbnail || 
            !category
        ){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if(!status || status === undefined){
            status = "Draft";
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
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
          return res.status(404).json({
            success: false,
            message: "Category Details not found",
          });
        }

        // Upload image top cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        console.log(thumbnailImage)
        // Create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price, 
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
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

        // Add the new course to the Categories
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
                    course: newCourse._id,
                },
            },
            {new: true}
        )

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
        // .populate("ratingAndreviews")
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