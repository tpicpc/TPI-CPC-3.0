import BlogForm from "@/components/admin/BlogForm";
import PageHeader from "@/components/admin/PageHeader";

export default function NewBlogPage() {
  return (
    <div>
      <PageHeader title="New blog post" />
      <BlogForm />
    </div>
  );
}
