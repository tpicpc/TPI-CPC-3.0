"use client";

import AdvisorCard from "@/components/AdvisorCard";
import SectionTitle from "@/components/SectionTitle";
import TeamMember from "@/components/TeamMember";
import { TeamGridSkeleton } from "@/components/skeletons";
import { useHomeData } from "@/contexts/HomeDataContext";
import { sortMembers } from "@/lib/utils";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export default function TeamsPage() {
  const { data: home } = useHomeData();
  const [data, setData] = useState({ currentYear: null, current: [], past: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/team/list");
        if (data.success) setData(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const advisors = home?.advisors || [];
  const currentYear = data.currentYear;
  const sortedCurrent = useMemo(() => sortMembers(data.current || []), [data.current]);
  const pastYears = useMemo(
    () => Object.keys(data.past || {}).sort((a, b) => b - a),
    [data.past]
  );

  return (
    <div className="px-4 md:px-10 container mx-auto py-12 md:py-16 space-y-20">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 bg-clip-text text-transparent mb-4">
          Our Team
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          The people who keep TPI CPC running — past and present. Hover over any member to see their socials.
        </p>
      </header>

      {advisors.length > 0 && (
        <section>
          <SectionTitle
            title="Our Advisors"
            subtitle="The mentors guiding our community"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {advisors.map((a) => <AdvisorCard key={a._id} advisor={a} />)}
          </div>
        </section>
      )}

      <section>
        <SectionTitle
          title={`Meet Our Team Members ${currentYear || ""}`}
          subtitle="The current executive committee"
        />
        {loading ? (
          <TeamGridSkeleton count={10} />
        ) : sortedCurrent.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No team members for this year yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
            {sortedCurrent.map((m) => <TeamMember key={m._id} member={m} />)}
          </div>
        )}
      </section>

      {pastYears.length > 0 && (
        <section>
          <SectionTitle
            title="Ex Team Members"
            subtitle="Legends who built our foundations"
          />
          <div className="space-y-16">
            {pastYears.map((year) => {
              const members = sortMembers(data.past[year] || []);
              return (
                <div key={year}>
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-indigo-300/50 dark:to-indigo-500/30" />
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                      Team {year}
                    </h3>
                    <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-indigo-300/50 dark:to-indigo-500/30" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 justify-items-center">
                    {members.map((m) => <TeamMember key={m._id} member={m} size="sm" />)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
