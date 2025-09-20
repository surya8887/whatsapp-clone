import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateOtp from "../utils/generateOtp.js";
import { sendOtpEmail } from "../services/nodemailerService.js";
import {
  SendOtpToPhoneNumber,
  VerifyOtpFromPhoneNumber,
} from "../services/twilloService.js";
import { generateToken, setTokenCookies } from "../utils/generateToken.js";
import { uploadOnCloudinary } from "../config/cloudinaryConfig.js";

// <=================Send OTP =============>

const SendOTP = asyncHandler(async (req, res) => {
  const { phone, prefix, email } = req.body;
  const otp = generateOtp();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  let user;

  if (email) {
    user = await User.findOne({ email });
    if (!user) user = new User({ email, isVerified: false });

    user.emailOtp = otp;
    user.emailOtpExpire = expiry;
    await sendOtpEmail(email, otp);
    await user.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "OTP sent to email successfully"));
  }

  if (phone && prefix) {
    const fullnumber = `${prefix}${phone}`;
    user = await User.findOne({ phone, prefix });
    if (!user) user = new User({ phone, prefix, isVerified: false });

    // Twilio handles OTP generation/verification internally
    await SendOtpToPhoneNumber(fullnumber);
    await user.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "OTP sent to phone successfully"));
  }

  throw new ApiError(400, "Either email or phone+prefix are required");
});

// Verify OTP ===>
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, phone, prefix, otp } = req.body;
  if (!otp) throw new ApiError(400, "OTP is required");

  let user;

  if (email) {
    user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    if (!user.emailOtp || !user.emailOtpExpire)
      throw new ApiError(400, "No OTP requested for this email");

    if (user.emailOtpExpire < Date.now())
      throw new ApiError(400, "OTP expired");

    if (user.emailOtp !== otp) throw new ApiError(400, "Invalid OTP");

    user.emailOtp = undefined;
    user.emailOtpExpire = undefined;
    user.isVerified = true;
    await user.save();
  }

  if (phone && prefix) {
    user = await User.findOne({ phone, prefix });
    if (!user) throw new ApiError(404, "User not found");

    const fullnumber = `${prefix}${phone}`;
    const result = await VerifyOtpFromPhoneNumber(fullnumber, otp);

    if (!result.success) throw new ApiError(400, "Invalid OTP");

    user.isVerified = true;
    await user.save();
  }

  if (!user)
    throw new ApiError(400, "Either email or phone+prefix are required");

  // ✅ Generate tokens AFTER successful verification
  const { accessToken, refreshToken } = await generateToken(user._id);
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(200).json(
    new ApiResponse(200, "User verified successfully", {
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    })
  );
});

//  <=================== Update Profile  ==============>

const updateProfile = asyncHandler(async function (req, res) {
  const { profilePicture, agreed, about, username } = req.body; // ✅ Destructure username too

  const userId = req.user?._id;
  console.log(userId);

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ✅ Handle profile picture upload
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file);
    if (!uploadResult?.secure_url) {
      throw new ApiError(500, "Failed to upload profile picture");
    }
    user.profilePicture = uploadResult.secure_url; // ✅ Use uploadResult not updateProfile
  } else if (profilePicture) {
    user.profilePicture = profilePicture;
  }

  // ✅ Update other fields safely
  if (username) user.username = username;
  if (agreed) user.agreed = agreed; // ✅ Fixed typo (agredd)
  if (about) user.about = about;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "User Updated Successfullu ", user));
});

//  logout User

const logout = asyncHandler(async function (req, res) {

  // const userId = req.user._id;

  
  // await User.findByIdAndUpdate(
  //   userId,
  //   {
  //     $unset: { refreshToken: 1 },
  //   },
  //   { new: true }
  // );

  const options = {
    httpOnly: true,
    secure: true, // set to true only in production (with HTTPS)
    sameSite: "strict", // recommended for security
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


export { SendOTP, verifyOTP, updateProfile,logout };
