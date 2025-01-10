const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create a sub-section for a given section
exports.createSubSection = async (req, res) => {
    try{
        // fetch data
        const {sectionId, title, description} = req.body;
        const video = req.files.video

        // check if all data are provided
        if(!sectionId || !title || !description || !video){
            return res.status(404).json({
                success: false,
                message: "All fields are required",
            })
        }
        console.log(video);

        // Upload the video file to Cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            video, process.env.FOLDER_NAME
        )
        console.log(uploadDetails);
        // create a new sub-section with necessary details
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })

        // Update the corresponding section with the newly created subsection
        const updateSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {$push: {subSection: subSectionDetails._id}},
            {new: true},
        ).populate("subSection")

        return res.status(200).json({
            success: true,
            data: updatedSection,
        })
    }catch(error){
        console.error("Error creating new sub-section: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}