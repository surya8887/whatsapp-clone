import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    prefix: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      validate: {
        validator: (value) => value.includes("@"),
        message: "Email must contain @",
      },
    },
    username: {
      type: String,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    emailOtp: {
      type: String,
      select: false,
    },
    emailOtpExpire: {
      type: Date,
      select: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      trim: true,
      maxlength: [200, "About section cannot exceed 200 characters"],
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    agreed: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false, // hide refresh token by default
    },
  },
  { timestamps: true }
);


userSchema.methods.generateAccessToken = function () {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
