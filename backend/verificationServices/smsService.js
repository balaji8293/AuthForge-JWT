const twilio = require("twilio");
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE
  ) {
    console.warn("⚠️ Twilio env vars missing, SMS skipped");
    return;
  }
const client = new twilio(
  "skldfjsdlkf",  //this is sample due to security reasons
  "lksdjf"  //this is sample due to security reasons
);

async function sendOTPSMS(phone, otp,name) {
  await client.messages.create({
    body: `Hi ${name} Your Auth_system account creation OTP is ${otp}. Valid for 10 minutes.`,
    from: "+19346209975",   //this is sample Twilio phone number due to security reasons
    to: phone
  });
}


module.exports = sendOTPSMS;
