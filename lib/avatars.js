export const GENDERS = ["male", "female", "other"];

export function getDefaultAvatar(gender) {
  if (gender === "female") return "/avatar-female.svg";
  if (gender === "male") return "/avatar-male.svg";
  return "/avatar-neutral.svg";
}

// Heuristic: best-effort gender guess from a name. Returns "male" | "female" | ""
const FEMALE_HINTS = [
  /\bakter\b/i, /\baktar\b/i, /\bbegum\b/i, /\bkhatun\b/i,
  /\brinky\b/i, /\bmitu\b/i, /\btasnim\b/i, /\bbushra\b/i,
  /\batia\b/i, /\bmaria\b/i, /\bnadia\b/i, /\bsadia\b/i, /\bfatima\b/i,
  /\bjannatul\b/i, /\bsumaiya\b/i, /\bzarin\b/i, /\bzahin\b/i,
  /\bayesha\b/i, /\baisha\b/i, /\bmuntaha\b/i, /\barifa\b/i,
  /\bkhadija\b/i, /\bnusrat\b/i, /\bnafisa\b/i, /\bnahida\b/i,
  /\briya\b/i, /\bnishi\b/i, /\bpriya\b/i, /\bsumi\b/i,
  /\bmst\.?\b/i, /\bms\.?\b/i, /\bmiss\b/i, /\bmrs\.?\b/i,
];
const MALE_HINTS = [
  /\bmd\.?\b/i, /\bmohammad\b/i, /\bmohammed\b/i, /\bmuhammad\b/i,
  /\bahmed\b/i, /\bahmad\b/i, /\bhossain\b/i, /\bhasan\b/i, /\bhassan\b/i,
  /\brahman\b/i, /\bislam\b/i, /\bkhan\b/i, /\babdul\b/i, /\bsheikh\b/i,
  /\bhaque\b/i, /\bhaq\b/i, /\bmir\b/i, /\bsiddique\b/i,
  /\bmohan\b/i, /\bsohan\b/i, /\bsajjad\b/i, /\brakib\b/i, /\brohan\b/i,
  /\bmurad\b/i, /\bsahinur\b/i, /\bmubin\b/i, /\bsiam\b/i, /\babir\b/i,
  /\bdipok\b/i, /\bnimur\b/i, /\bsakib\b/i, /\bnifad\b/i,
];

export function guessGender(name = "") {
  const n = ` ${name} `;
  for (const re of FEMALE_HINTS) if (re.test(n)) return "female";
  for (const re of MALE_HINTS) if (re.test(n)) return "male";
  return "";
}
