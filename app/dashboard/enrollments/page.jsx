"use client";

import { CardGridSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { BookOpen, LoaderCircle, PlayCircle, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/v1/me/enrollments", { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setEnrollments(data.enrollments);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white">My Courses</h1>
      {loading ? (
        <CardGridSkeleton count={3} />
      ) : enrollments.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="font-medium text-gray-700 dark:text-gray-300">No enrolled courses yet</p>
          <Link href="/workshop" className="text-indigo-500 hover:underline text-sm mt-2 inline-block">Browse courses →</Link>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((e) => (
            <Link key={e._id} href={`/workshop/${e.workshop.slug}`} className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition group">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                <img src={e.workshop.thumbnail} alt={e.workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition" size={48} />
              </div>
              <div className="p-4">
                <span className="text-[10px] uppercase tracking-wide text-indigo-500 font-bold">{e.workshop.category}</span>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mt-1">{e.workshop.title}</h3>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><User size={11} /> {e.workshop.instructor}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
