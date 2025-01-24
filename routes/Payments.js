// import the required modules
const express = require("express")
const router = express.router()

const {capturePayment, verifySignature} = require("../controllers/Payments")
const {auth, isInstructor, isStudent, isAdmin} = require("../middlewares/auth");
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verfiySignature", verifySignature)

module.exports = router