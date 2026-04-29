import { getDefaultAvatar } from "@/lib/avatars";
import { Facebook, Github, Linkedin } from "lucide-react";

export default function TeamMember({ member, size = "md" }) {
  const avatar =
    member.memberProfile ||
    member.advisorProfile ||
    member.image ||
    getDefaultAvatar(member.gender);
  const role = member.position || member.role;

  const sizeMap = {
    sm: "w-28 h-28 sm:w-32 sm:h-32",
    md: "w-36 h-36 sm:w-40 sm:h-40",
    lg: "w-44 h-44 sm:w-52 sm:h-52",
  };

  return (
    <div className="group flex flex-col items-center text-center">
      <div className={`relative ${sizeMap[size] || sizeMap.md} rounded-full p-1 bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-indigo-500/30`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900 ring-2 ring-white dark:ring-gray-950">
          <img
            src={avatar}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      <h3 className="font-bold text-base sm:text-lg mt-4 text-gray-900 dark:text-white tracking-tight">
        {member.name}
      </h3>
      <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
        {role}
      </p>

      {(member.facebook || member.linkedin || member.github) && (
        <div className="flex items-center justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {member.facebook && (
            <a href={member.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white flex items-center justify-center transition">
              <Facebook size={14} />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white flex items-center justify-center transition">
              <Linkedin size={14} />
            </a>
          )}
          {member.github && (
            <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-900 hover:text-white flex items-center justify-center transition">
              <Github size={14} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
