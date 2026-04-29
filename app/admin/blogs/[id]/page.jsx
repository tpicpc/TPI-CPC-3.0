"use client";

import BlogForm from "@/components/admin/BlogForm";
import PageHeader from "@/components/admin/PageHeader";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader title="Edit blog post" />
      <BlogForm id={id} />
    </div>
  );
}
