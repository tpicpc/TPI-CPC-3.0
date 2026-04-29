"use client";

import SectionTitle from "@/components/SectionTitle";
import { ListRowSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { LoaderCircle, MessageSquarePlus, Quote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestimonialsPage() {
  const router = useRouter();
  const { userData } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/review/list");
        if (data.success) setReviews(data.reviews);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onShare = () => {
    if (userData) router.push("/add-review");
    else router.push("/login?redirect=/add-review");
  };

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle
        title="What Our Members Say"
        subtitle="Real stories from TPI CPC members. Add your voice and inspire the next generation of coders."
      />

      <div className="flex flex-col items-center mb-10">
        <Button onClick={onShare} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white h-11 px-6">
          <MessageSquarePlus size={18} className="mr-2" />
          {userData ? "Share Your Review" : "Sign in to Share Your Review"}
        </Button>
        {!userData && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            New here?{" "}
            <Link href="/signup" className="text-indigo-500 hover:underline">Create an account</Link>
            {" "}to share your experience.
          </p>
        )}
      </div>

      {loading ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid"><ListRowSkeleton /></div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No testimonials yet — be the first to share!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {reviews.map((r) => (
            <div key={r._id} className="break-inside-avoid rounded-xl border border-gray-200 dark:border-white/10 p-5 bg-white/80 dark:bg-white/5 backdrop-blur-sm relative">
              <Quote size={28} className="absolute top-3 right-3 text-indigo-200 dark:text-indigo-500/30" />
              <div className="flex items-center gap-3 mb-3">
                {r.profileImage ? (
                  <img src={r.profileImage} alt={r.fullName} className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-900" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-gray-900">
                    {r.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{r.fullName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{r.department} · {r.semester} sem</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.reviewMessage}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
