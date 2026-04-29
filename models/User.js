import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true },
    rollNumber: { type: String, required: true },
    department: { type: String, required: true },
    shift: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profileImage: { type: String, default: "" },
    otp: { type: Number, default: null },
    otpExpiresAt: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    verifyOtp: { type: Number, default: null },
    verifyOtpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
