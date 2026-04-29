import LeaderboardForm from "@/components/admin/LeaderboardForm";
import PageHeader from "@/components/admin/PageHeader";

export default function NewLeaderboardPage() {
  return (
    <div>
      <PageHeader title="Add leaderboard entry" />
      <LeaderboardForm />
    </div>
  );
}
