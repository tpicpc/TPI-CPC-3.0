"use client";

import PageHeader from "@/components/admin/PageHeader";
import TeamForm from "@/components/admin/TeamForm";
import { useParams } from "next/navigation";

export default function EditTeamPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader title="Edit team member" />
      <TeamForm id={id} />
    </div>
  );
}
