import AdvisorForm from "@/components/admin/AdvisorForm";
import PageHeader from "@/components/admin/PageHeader";

export default function NewAdvisorPage() {
  return (
    <div>
      <PageHeader title="Add advisor" />
      <AdvisorForm />
    </div>
  );
}
