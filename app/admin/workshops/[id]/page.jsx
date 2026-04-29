"use client";

import PageHeader from "@/components/admin/PageHeader";
import WorkshopForm from "@/components/admin/WorkshopForm";
import { useParams } from "next/navigation";

export default function EditWorkshopPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader title="Edit course" />
      <WorkshopForm id={id} />
    </div>
  );
}
