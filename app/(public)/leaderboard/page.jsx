"use client";

import SectionTitle from "@/components/SectionTitle";
import { TableSkeleton } from "@/components/skeletons";
import { getDefaultAvatar } from "@/lib/avatars";
import axios from "axios";
import { Award, BookOpen, Calendar, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [tab, setTab] = useState("yearly"); // yearly | courses
  const [yearData, setYearData] = useState({ entries: [], years: [], year: new Date().getFullYear() });
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (tab !== "yearly") return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/leaderboard/list?year=${year}`);
        if (data.success) setYearData(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [year, tab]);

  useEffect(() => {
    if (tab !== "courses") return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/leaderboard/courses");
        if (data.success) setCourseData(data.entries);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);

  const podium = (rank) => {
    if (rank === 0) return <Trophy className="text-yellow-500" size={20} />;
    if (rank === 1) return <Medal className="text-gray-400" size={20} />;
    if (rank === 2) return <Award className="text-orange-500" size={20} />;
    return <span className="text-sm text-gray-500 font-medium">#{rank + 1}</span>;
  };

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle
        title="Leaderboard"
        subtitle="Top performers across yearly competitions and course learning"
      />

      <div className="flex items-center justify-center gap-1 mb-6 bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1 max-w-md mx-auto">
        <button
          onClick={() => setTab("yearly")}
          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === "yearly" ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <Calendar size={15} /> Yearly
        </button>
        <button
          onClick={() => setTab("courses")}
          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === "courses" ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <BookOpen size={15} /> By Courses
        </button>
      </div>

      {tab === "yearly" && yearData.years?.length > 1 && (
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {yearData.years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                year === y ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : tab === "yearly" ? (
        yearData.entries.length === 0 ? (
          <p className="text-center text-gray-500">No leaderboard entries yet for {year}.</p>
        ) : (
          <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Rank</th>
                  <th className="text-left px-4 py-3 text-sm">Member</th>
                  <th className="text-right px-4 py-3 text-sm">Points</th>
                  <th className="text-right px-4 py-3 text-sm hidden sm:table-cell">Contributions</th>
                </tr>
              </thead>
              <tbody>
                {yearData.entries.map((e, i) => (
                  <tr key={e._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3"><div className="flex items-center justify-center w-8">{podium(i)}</div></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={e.profileImage || getDefaultAvatar(e.gender)} alt={e.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{e.name}</div>
                          <div className="text-xs text-gray-500">{e.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-500">{e.points}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-600 dark:text-gray-400">{e.contributions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Courses leaderboard
        courseData.length === 0 ? (
          <p className="text-center text-gray-500">No course enrollments yet — be the first to enroll!</p>
        ) : (
          <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Rank</th>
                  <th className="text-left px-4 py-3 text-sm">Member</th>
                  <th className="text-right px-4 py-3 text-sm">Courses</th>
                  <th className="text-right px-4 py-3 text-sm hidden sm:table-cell">Lessons watched</th>
                  <th className="text-right px-4 py-3 text-sm">Score</th>
                </tr>
              </thead>
              <tbody>
                {courseData.map((e, i) => (
                  <tr key={e._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3"><div className="flex items-center justify-center w-8">{podium(i)}</div></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={e.profileImage || getDefaultAvatar(e.gender)} alt={e.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{e.name}</div>
                          <div className="text-xs text-gray-500">{e.department}{e.shift ? ` · ${e.shift} shift` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">{e.enrollmentCount}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-600 dark:text-gray-400">{e.completedLessons}</td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-500">{e.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
