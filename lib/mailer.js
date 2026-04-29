import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    transporter = {
      sendMail: async ({ to, subject, text }) => {
        console.log(`[mailer:dev] to=${to} subject=${subject}\n${text}`);
        return { messageId: "dev-mode" };
      },
    };
    return transporter;
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

export function generate4DigitOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

export async function sendVerifyEmail(to, name, otp) {
  const t = getTransporter();
  return t.sendMail({
    from: `"TPI CPC" <${process.env.EMAIL_USER || "noreply@tpicpc.com"}>`,
    to,
    subject: `Verify your TPI CPC account — code ${otp}`,
    text: `Hi ${name || "there"},

Your TPI CPC verification code is: ${otp}

This code expires in 15 minutes. Enter it on the verification page to activate your account and start enrolling in courses.

— The TPI CPC Team`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Verify your account</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
        <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:28px;text-align:center;color:#fff;">
          <div style="font-size:13px;letter-spacing:2px;opacity:0.85;text-transform:uppercase;font-weight:600;">TPI CPC · Email verification</div>
          <div style="font-size:24px;font-weight:800;margin-top:8px;">Verify your email</div>
        </td></tr>
        <tr><td style="padding:32px 28px;text-align:center;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;text-align:left;">Hi <strong>${name || "there"}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4b5563;text-align:left;">Use the code below to verify your email and activate your account.</p>
          <div style="display:inline-block;background:linear-gradient(135deg,#eef2ff,#f5f3ff);padding:18px 32px;border-radius:12px;border:1px dashed #6366f1;">
            <div style="font-size:34px;font-weight:800;letter-spacing:14px;color:#4f46e5;font-family:'SF Mono',Menlo,monospace;">${otp}</div>
          </div>
          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">This code expires in 15 minutes.</p>
          <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">If you didn't sign up, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:18px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
          <strong style="color:#374151;">TPI CPC</strong> — Computer & Programming Club
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  });
}

export function otpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function sendEnrollmentEmail(to, name, course) {
  const t = getTransporter();
  const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://tpicpc.com"}/workshop/${course.slug}`;
  const lessonCount = course.lessons?.length || 0;
  const tagline = course.category ? `${course.category} · ${course.level}` : course.level;

  return t.sendMail({
    from: `"TPI CPC" <${process.env.EMAIL_USER || "noreply@tpicpc.com"}>`,
    to,
    subject: `🎉 Enrollment confirmed: ${course.title}`,
    text: `Hi ${name || "there"},

Welcome to ${course.title}!

You've successfully enrolled in this ${tagline} course on TPI CPC.

Course: ${course.title}
Instructor: ${course.instructor}
Lessons: ${lessonCount}

Start learning: ${courseUrl}

Happy coding!
— The TPI CPC Team`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enrollment confirmed</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">

        <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 28px;text-align:center;color:#fff;">
          <div style="font-size:14px;letter-spacing:2px;opacity:0.85;text-transform:uppercase;font-weight:600;">TPI CPC · Enrollment Confirmed</div>
          <div style="font-size:28px;font-weight:800;margin-top:8px;line-height:1.2;">You're in! 🎉</div>
        </td></tr>

        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi <strong>${name || "there"}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
            Welcome aboard! You've successfully enrolled in the course below. Your access is unlocked — start learning anytime.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            ${course.thumbnail ? `<tr><td><img src="${course.thumbnail}" alt="${course.title}" style="display:block;width:100%;max-height:220px;object-fit:cover;" /></td></tr>` : ""}
            <tr><td style="padding:20px 24px;">
              <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6366f1;font-weight:700;">${tagline}</div>
              <div style="font-size:20px;font-weight:700;color:#111827;margin:6px 0 12px;line-height:1.3;">${course.title}</div>
              <div style="font-size:14px;color:#6b7280;line-height:1.6;">
                <span style="display:inline-block;margin-right:18px;">👨‍🏫 <strong>${course.instructor}</strong></span>
                <span style="display:inline-block;">📚 ${lessonCount} lesson${lessonCount === 1 ? "" : "s"}</span>
              </div>
            </td></tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" style="padding-bottom:24px;">
              <a href="${courseUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:10px;font-size:15px;box-shadow:0 4px 12px rgba(99,102,241,0.3);">Start learning →</a>
            </td></tr>
          </table>

          <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-size:13px;line-height:1.6;color:#6b7280;">
            <p style="margin:0 0 8px;"><strong style="color:#111827;">What's next?</strong></p>
            <ul style="margin:0;padding-left:20px;">
              <li>Watch lessons in any order — your progress is saved automatically.</li>
              <li>Use the Up Next button to flow through the playlist.</li>
              <li>Reach out anytime at <a href="mailto:tpicpc@gmail.com" style="color:#6366f1;">tpicpc@gmail.com</a> if you need help.</li>
            </ul>
          </div>
        </td></tr>

        <tr><td style="background:#f9fafb;padding:20px 28px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
          <div style="margin-bottom:6px;"><strong style="color:#374151;">TPI CPC</strong> — Computer & Programming Club</div>
          <div>Thakurgaon Polytechnic Institute · Bangladesh</div>
          <div style="margin-top:10px;">
            <a href="https://web.facebook.com/groups/tpicpc" style="color:#6366f1;text-decoration:none;margin:0 6px;">Facebook</a> ·
            <a href="https://github.com/tpicpc" style="color:#6366f1;text-decoration:none;margin:0 6px;">GitHub</a> ·
            <a href="https://www.youtube.com/@tpicpc" style="color:#6366f1;text-decoration:none;margin:0 6px;">YouTube</a>
          </div>
        </td></tr>
      </table>
      <div style="margin-top:14px;font-size:11px;color:#9ca3af;">You received this because you enrolled in a TPI CPC course.</div>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendOtpEmail(to, otp) {
  const t = getTransporter();
  return t.sendMail({
    from: process.env.EMAIL_USER || "noreply@tpicpc.com",
    to,
    subject: "TPI CPC — Your verification code",
    text: `Your TPI CPC verification code is ${otp}. It expires in 10 minutes.`,
    html: `<div style="font-family:sans-serif;padding:24px;background:#f6f7fb;border-radius:12px;max-width:480px;margin:auto">
      <h2 style="color:#4f46e5">TPI CPC Verification</h2>
      <p>Use the code below to continue:</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:8px;background:#fff;padding:14px 20px;border-radius:8px;text-align:center;border:1px dashed #4f46e5">${otp}</div>
      <p style="color:#6b7280;font-size:13px;margin-top:16px">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
    </div>`,
  });
}
