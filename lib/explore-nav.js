// Grouped "Explore" navigation for the club features (desktop dropdown + mobile drawer).
export const EXPLORE_GROUPS = [
  {
    title: "Practice",
    items: [
      { name: "Contest tracker", path: "/contests", icon: "Trophy", desc: "Upcoming CF, CodeChef & AtCoder rounds" },
      { name: "Challenges", path: "/challenges", icon: "Target", desc: "Daily & weekly problems, earn points" },
      { name: "Learning path", path: "/learn", icon: "Route", desc: "Beginner → Advanced roadmap" },
    ],
  },
  {
    title: "Community",
    items: [
      { name: "Notice board", path: "/notices", icon: "Megaphone", desc: "Official club announcements" },
      { name: "Calendar", path: "/calendar", icon: "CalendarDays", desc: "Events & challenge dates" },
      { name: "Alumni", path: "/alumni", icon: "GraduationCap", desc: "Where our alumni work now" },
      { name: "Jobs & internships", path: "/jobs", icon: "Briefcase", desc: "Openings shared with the club" },
    ],
  },
];

export const EXPLORE_PATHS = EXPLORE_GROUPS.flatMap((g) => g.items.map((i) => i.path));
