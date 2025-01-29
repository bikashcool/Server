const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// Create a new Section
exports.createSection = async (req, res) => {
    try{
        // extract the properties
        const {sectionName, courseId} = req.body;

        // validate the input
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing required Properties",
            });
        }

        // Create a new section with the given name
        const newSection = await Section.create({sectionName});

        // add the new section to the course's content array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            {new: true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec();

        // Return the updated course object in the response
        res.status(200).json({
            success: true,
            message: "Section created Successfully",
            updatedCourse,
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update a section
exports.updateSection = async (req, res) => {
    try{
        const {sectionName, sectionId} = req.body;
        const section = await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new : true},
        );
        return res.status(200).json({
            success: true,
            message: "Section updated Successfully",
            section,
        });
    }catch(error){
        console.error("Error updating section: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Delete a section
exports.deleteSection = async (req, res) => {
    try{
        const {sectionId} = req.body;
        await Section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success: true,
            message: "Section Deleted Successfully",
        });
    }catch(error){
        console.error("Error deleting Section", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};