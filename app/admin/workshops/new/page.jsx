import PageHeader from "@/components/admin/PageHeader";
import WorkshopForm from "@/components/admin/WorkshopForm";

export default function NewWorkshopPage() {
  return (
    <div>
      <PageHeader title="New course" description="Add a multi-lesson course or a single YouTube playlist." />
      <WorkshopForm />
    </div>
  );
}
