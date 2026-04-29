import EventForm from "@/components/admin/EventForm";
import PageHeader from "@/components/admin/PageHeader";

export default function NewEventPage() {
  return (
    <div>
      <PageHeader title="Add event" />
      <EventForm />
    </div>
  );
}
