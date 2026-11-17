// Consistent page header for the club pages (contests, challenges, learn, …).
export default function ClubHero({ eyebrow, icon, title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden border-b border-gray-200/70 dark:border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent dark:from-indigo-500/15 dark:via-violet-500/10" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative px-4 md:px-10 container mx-auto py-10 md:py-14">
        {eyebrow && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            {icon} {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
        active
          ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
          : "bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500/50"
      }`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 py-14 px-6 text-center">
      {icon && <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">{icon}</div>}
      <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
      {children && <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{children}</div>}
    </div>
  );
}

export const panel = "rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm";
