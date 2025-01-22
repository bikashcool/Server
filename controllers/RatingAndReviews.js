const RatingAndReview = require("../models/RatingAndReviews");
const Course = require("../models/Course");
const {mongo, default: mongoose} = require("mongoose");

// create Rating
exports.createRating = async (req, res) => {
    try{
        // fetch user id
        const userId = req.user.userId;
        // fetch data from req body
        const {rating, review, courseId} = req.body;
        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: {$elemMatch: {$eq: userId}},
            }
        );
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the course',
            });
        }

        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user',
            });
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });

        // update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id: courseId},
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            {new: true}
        );

        console.log(updatedCourseDetails);
        
        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review created Successfully",
            ratingReview,
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occured while creating rating and review",
        })
    }
}

// getAverage Rating
const getAverageRating = async (req, res) => {
    try{
        // get course Id
        const courseId = req.body.courseId;
        
        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])

        // return rating
        if(result.length > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        // if no rating review exist response
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, No Rating given till now",
            averageRating: 0,
        });
    }catch{
        console.error(error);
        return res.status(500).json({
            success : false,
            message: "Error occured while getting avergage rating",
        });
    }
}

// Get all rating and Reviews
exports.getAllRating = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                .sort({rating: "desc"})
                                .populate({
                                    path: "user",
                                    select: "firstName lastName email image",
                                })
                                .populate({
                                    path: "course",
                                    select: "courseName",
                                })
                                .exec();

        return res.json(200).json({
            success: true,
            message: "All Rating and review fetched successfully",
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "error occurred while fetching all Rating & Reviews",
        });
    }
}