"use client";

import BlogEditor from "@/components/blog/BlogEditor";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SubmitBlogPage() {
  const router = useRouter();
  const { userData, loading } = useUser();

  useEffect(() => {
    if (!loading && !userData) router.push("/login?redirect=/submit-blog");
    if (userData && userData.emailVerified === false) {
      router.push("/verify-email?redirect=/submit-blog");
    }
  }, [userData, loading, router]);

  if (loading || !userData) {
    return <div className="min-h-[40vh] flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <BlogEditor
        mode="user"
        api={userApi}
        currentUser={userData}
        backHref="/dashboard/blogs"
        onDone={() => router.push("/dashboard/blogs")}
      />
    </div>
  );
}
