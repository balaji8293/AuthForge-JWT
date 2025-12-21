const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "balajisanap@gmail.com",       // this is sample sender email due to security reasons 
        pass: "slfksdjdslk",           //this is Gmail App Password due to security reasons
    },
});

async function sendOTPEmail(toEmail, otp) {
    await transporter.sendMail({
        from: "Auth System <Balajisanap101@gmail.com>",
        to: toEmail,
        subject: "Verify Your OTP",
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });
}

module.exports = sendOTPEmail;