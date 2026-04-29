"use client";

import AdvisorForm from "@/components/admin/AdvisorForm";
import PageHeader from "@/components/admin/PageHeader";
import { useParams } from "next/navigation";

export default function EditAdvisorPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader title="Edit advisor" />
      <AdvisorForm id={id} />
    </div>
  );
}
