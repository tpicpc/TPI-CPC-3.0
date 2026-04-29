import { getDefaultAvatar } from "@/lib/avatars";
import { GraduationCap } from "lucide-react";

function tierFor(position = "") {
  const p = position.toLowerCase();
  if (p.includes("senior")) return { label: "Senior", color: "from-amber-500 to-orange-500", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" };
  if (p.includes("junior")) return { label: "Junior", color: "from-blue-500 to-indigo-500", chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" };
  if (p.includes("co-")) return { label: "Co-Advisor", color: "from-violet-500 to-purple-500", chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30" };
  return { label: "Advisor", color: "from-indigo-500 to-blue-500", chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" };
}

export default function AdvisorCard({ advisor }) {
  const tier = tierFor(advisor.position);
  return (
    <article className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:border-amber-400/50 dark:hover:border-amber-400/40 transition-all duration-300">
      <div className={`absolute -top-px left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />

      <div className="relative pt-7 px-5 pb-5">
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${tier.chip}`}>
            <GraduationCap size={11} /> {tier.label}
          </span>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className={`relative w-32 h-32 rounded-2xl p-[3px] bg-gradient-to-br ${tier.color} shadow-lg`}>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tier.color} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
            <div className="relative w-full h-full rounded-[14px] overflow-hidden ring-2 ring-white dark:ring-gray-950 bg-gray-100 dark:bg-gray-800">
              <img
                src={advisor.advisorProfile || getDefaultAvatar(advisor.gender)}
                alt={advisor.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight leading-snug">
            {advisor.name}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            {advisor.position}
          </p>
        </div>
      </div>
    </article>
  );
}
