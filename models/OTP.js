import mailSender from "../utils/mailSender";

const mongoose = require("mongoose");

const OTPschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60, // automatically deleted after 5minutes of its creation time
  },
});

// define a function to send mails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email for EduVen",
      emailTemplate(otp) // import?
    );
    console.log("Email sent Successfully :", mailResponse.response);
  } catch (error) {
    console.log("Error occured while sending email: ", error);
    throw error;
  }
}

OTPschema.pre("save", async function(next){
    console.log("New Document saved to database");

    // only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("OTP", OTPschema);
