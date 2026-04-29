import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly (next.js convention, not auto-loaded by dotenv)
try {
  const env = readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
const email = (process.env.ADMIN_SEED_EMAIL || "admin@tpicpc.com").toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD || "admin123";
const name = process.env.ADMIN_SEED_NAME || "TPI CPC Admin";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    adminProfile: { type: String, default: "" },
    otp: { type: Number, default: null },
    otpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const existing = await Admin.findOne({ email });
    const hashed = await bcrypt.hash(password, 10);
    if (existing) {
      existing.password = hashed;
      existing.name = name;
      await existing.save();
      console.log(`Admin already existed — password reset to "${password}"`);
    } else {
      await Admin.create({ name, email, password: hashed, adminProfile: "" });
      console.log("Admin created successfully:");
    }
    console.log("  email:    " + email);
    console.log("  password: " + password);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();
