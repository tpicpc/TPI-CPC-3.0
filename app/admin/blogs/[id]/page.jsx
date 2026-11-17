"use client";

import BlogForm from "@/components/admin/BlogForm";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const { id } = useParams();
  return <BlogForm id={id} />;
}
