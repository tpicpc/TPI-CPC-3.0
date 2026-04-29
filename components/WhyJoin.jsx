"use client";

import SectionTitle from "@/components/SectionTitle";
import { whyJoinTPICPC } from "@/lib/assets";
import {
  Brain,
  Check,
  Code2,
  Crown,
  Lightbulb,
  MessageCircle,
  Puzzle,
  Terminal,
  TrendingUp,
  Trophy,
  Users,
  UsersRound,
} from "lucide-react";

const ICONS = { Brain, Code2, Crown, Lightbulb, MessageCircle, Puzzle, Terminal, TrendingUp, Trophy, Users, UsersRound };

const ACCENTS = {
  indigo: { from: "from-indigo-500", to: "to-blue-500", ring: "ring-indigo-500/20", text: "text-indigo-500", border: "hover:border-indigo-400/50 dark:hover:border-indigo-400/40" },
  violet: { from: "from-violet-500", to: "to-purple-500", ring: "ring-violet-500/20", text: "text-violet-500", border: "hover:border-violet-400/50 dark:hover:border-violet-400/40" },
  blue: { from: "from-blue-500", to: "to-cyan-500", ring: "ring-blue-500/20", text: "text-blue-500", border: "hover:border-blue-400/50 dark:hover:border-blue-400/40" },
  emerald: { from: "from-emerald-500", to: "to-teal-500", ring: "ring-emerald-500/20", text: "text-emerald-500", border: "hover:border-emerald-400/50 dark:hover:border-emerald-400/40" },
  amber: { from: "from-amber-500", to: "to-orange-500", ring: "ring-amber-500/20", text: "text-amber-500", border: "hover:border-amber-400/50 dark:hover:border-amber-400/40" },
  cyan: { from: "from-cyan-500", to: "to-sky-500", ring: "ring-cyan-500/20", text: "text-cyan-500", border: "hover:border-cyan-400/50 dark:hover:border-cyan-400/40" },
  yellow: { from: "from-yellow-500", to: "to-amber-500", ring: "ring-yellow-500/20", text: "text-yellow-500", border: "hover:border-yellow-400/50 dark:hover:border-yellow-400/40" },
  pink: { from: "from-pink-500", to: "to-rose-500", ring: "ring-pink-500/20", text: "text-pink-500", border: "hover:border-pink-400/50 dark:hover:border-pink-400/40" },
  orange: { from: "from-orange-500", to: "to-red-500", ring: "ring-orange-500/20", text: "text-orange-500", border: "hover:border-orange-400/50 dark:hover:border-orange-400/40" },
  rose: { from: "from-rose-500", to: "to-pink-500", ring: "ring-rose-500/20", text: "text-rose-500", border: "hover:border-rose-400/50 dark:hover:border-rose-400/40" },
  purple: { from: "from-purple-500", to: "to-violet-500", ring: "ring-purple-500/20", text: "text-purple-500", border: "hover:border-purple-400/50 dark:hover:border-purple-400/40" },
};

export default function WhyJoin() {
  return (
    <section className="py-20 px-4 md:px-10 container mx-auto">
      <SectionTitle
        title="Why Join TPI CPC"
        subtitle="Joining TPI CPC means being part of a vibrant tech community where you grow your coding skills, explore new tech, and build leadership qualities."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr justify-items-center">
        {whyJoinTPICPC.map((item) => {
          const Icon = ICONS[item.icon] || Code2;
          const a = ACCENTS[item.accent] || ACCENTS.indigo;
          return (
            <article
              key={item.id}
              className={`group relative w-full max-w-sm rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-7 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl ${a.border}`}
            >
              <div className={`absolute -top-px -left-px -right-px h-1 bg-gradient-to-r ${a.from} ${a.to} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.from} ${a.to} text-white flex items-center justify-center shadow-lg ring-4 ${a.ring} mb-5 shrink-0`}>
                <Icon size={24} strokeWidth={2.2} />
              </div>

              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white tracking-tight">
                {item.title}
              </h3>

              <ul className="space-y-2 mt-auto w-full">
                {item.points.map((p, idx) => (
                  <li key={idx} className="flex items-start justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 leading-snug">
                    <Check size={15} className={`shrink-0 mt-0.5 ${a.text}`} strokeWidth={2.5} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
