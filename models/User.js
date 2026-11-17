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
    // ---- Public portfolio (all optional) ----
    headline: { type: String, default: "", maxlength: 120 },
    bio: { type: String, default: "", maxlength: 600 },
    skills: [{ type: String }],
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    facebook: { type: String, default: "" },
    website: { type: String, default: "" },
    handles: {
      codeforces: { type: String, default: "" },
      codechef: { type: String, default: "" },
      atcoder: { type: String, default: "" },
    },
    // Admin-awarded badges (automatic badges are computed on the fly)
    badges: [{ type: String }],
    // Points earned from weekly/daily challenges
    points: { type: Number, default: 0 },
    emailNotifications: { type: Boolean, default: true },
    // Show the certificates section on the public profile (per-certificate toggle lives on Certificate)
    showCertificates: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
