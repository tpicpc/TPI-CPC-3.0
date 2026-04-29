"use client";

import LeaderboardForm from "@/components/admin/LeaderboardForm";
import PageHeader from "@/components/admin/PageHeader";
import { useParams } from "next/navigation";

export default function EditLeaderboardPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader title="Edit leaderboard entry" />
      <LeaderboardForm id={id} />
    </div>
  );
}
