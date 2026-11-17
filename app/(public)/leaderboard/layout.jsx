import { FEATURES } from "@/lib/features";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Leaderboard",
  description: "Top performers in the TPI CPC community by year.",
};

// Hidden behind a feature flag; set FEATURES.leaderboard = true in lib/features.js to re-enable.
export default function LeaderboardLayout({ children }) {
  if (!FEATURES.leaderboard) notFound();
  return children;
}
