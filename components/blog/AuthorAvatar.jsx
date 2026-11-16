/* eslint-disable @next/next/no-img-element */

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "T";
}

export default function AuthorAvatar({ author, size = 44 }) {
  const style = { width: size, height: size };
  if (author?.avatar) {
    return <img src={author.avatar} alt={author.name} style={style} className="rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10 shrink-0" />;
  }
  if (author?.isClub) {
    return (
      <span style={style} className="rounded-full bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center shrink-0 overflow-hidden">
        <img src="/tpicpc_logo.png" alt="TPI CPC" className="w-[80%] h-[80%] object-contain" />
      </span>
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.38 }}
      className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold flex items-center justify-center shrink-0"
    >
      {initials(author?.name)}
    </span>
  );
}
