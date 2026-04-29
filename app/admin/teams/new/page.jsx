import PageHeader from "@/components/admin/PageHeader";
import TeamForm from "@/components/admin/TeamForm";

export default function NewTeamPage() {
  return (
    <div>
      <PageHeader title="Add team member" description="Create a new entry for the current or past team." />
      <TeamForm />
    </div>
  );
}
