import twilio from "twilio";
import ApiError from "../utils/ApiError.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

const SendOtpToPhoneNumber = async (phone) => {
  try {
    if (!phone) throw new ApiError(400, "Phone number is required");

    console.log(`Using Twilio Service SID: ${serviceSid}`);
    console.log(`Sending OTP to phone ending with ${phone.slice(-4)}`);

    const response = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return {
      success: true,
      message: "OTP sent successfully",
      sid: response.sid,
      status: response.status,
    };
  } catch (error) {
    console.error("Twilio OTP Error:", error?.message || error);
    throw new ApiError(400, error?.message || "Failed to send OTP to phone number");
  }
};

const VerifyOtpFromPhoneNumber = async (phone, code) => {
  try {
    console.log(phone,code);
    
    if (!phone || !code) throw new ApiError(400, "Phone and OTP code are required");

    console.log(`Using Twilio Service SID: ${serviceSid}`);
    console.log(`Verifying OTP for phone ending with ${phone.slice(-4)}`);

    const response = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phone,
        code,
      });

    if (response.status === "approved") {
      return { success: true, message: "OTP verified successfully" };
    }

    throw new ApiError(400, "Invalid or expired OTP");
  } catch (error) {
    console.error("Twilio Verify Error:", error?.message || error);
    throw new ApiError(400, error?.message || "OTP verification failed");
  }
};

export { SendOtpToPhoneNumber, VerifyOtpFromPhoneNumber };
