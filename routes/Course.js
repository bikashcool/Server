// Required Modules
const express = require("express")
const router = express.Router()

// Import the Controllers
// Course Controllers Import
const {
    createCourse, getAllCourses, getCourseDetails,
} = require("../controllers/Course")

// Categories Controllers Import
const {
  showAllCategory,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category");

// Import Section Controllers
const {
    createSection, updateSection, deleteSection,
} = require("../controllers/Section")

// Import Sub-Sections Controllers 
const {
    createSubSection, updateSubSection, deleteSubSection,
} = require("../controllers/Subsection")

// Import Rating Controllers
const {
    createRating, getAverageRating, getAllRating,
} = require("../controllers/RatingAndReviews")

// required middlewares
const {auth, isInstructor, isStudent, isAdmin} = require("../middlewares/auth");

// ************ Course Routes


// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)
// Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// update Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)

// ****************************** Category Routes (Only by Admin)

// Category can only be Created by Admin
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategory", showAllCategory);
router.post("/getCategoryPageDetails", categoryPageDetails)

// **********************  Rating And Review
router.post("/createRating", auth, isStudent, createRating)
router.post("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router