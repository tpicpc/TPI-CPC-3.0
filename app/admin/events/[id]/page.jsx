"use client";

import EventForm from "@/components/admin/EventForm";
import PageHeader from "@/components/admin/PageHeader";
import { useParams } from "next/navigation";

export default function EditEventPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader title="Edit event" />
      <EventForm id={id} />
    </div>
  );
}
