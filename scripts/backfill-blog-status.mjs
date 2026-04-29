import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const env = readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI not set"); process.exit(1); }

(async () => {
  await mongoose.connect(MONGODB_URI);
  const Blog = mongoose.model("Blog", new mongoose.Schema({}, { strict: false }), "blogs");
  const result = await Blog.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }, { status: "" }] },
    { $set: { status: "approved", approvedAt: new Date() } }
  );
  console.log(`Updated ${result.modifiedCount} blogs to status="approved"`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => { console.error(err); process.exit(1); });
