"use client";

import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, BadgeCheck, BookOpen, Calendar, Mail, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi().get(`/api/v1/admin/users/${id}`);
        if (data.success) {
          setUser(data.user);
          setEnrollments(data.enrollments);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!user) return <div className="py-20 text-center">User not found.</div>;

  const fields = [
    { label: "Email", value: user.email, icon: Mail },
    { label: "Mobile", value: user.mobileNumber, icon: Phone },
    { label: "Department", value: user.department },
    { label: "Shift", value: user.shift && `${user.shift} shift` },
    { label: "Roll number", value: user.rollNumber },
    { label: "Joined", value: formatDate(user.createdAt), icon: Calendar },
  ];

  return (
    <div>
      <PageHeader
        title="Member Details"
        action={
          <Link href="/admin/users">
            <Button variant="outline"><ArrowLeft size={16} className="mr-1" /> Back to members</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
          <img
            src={user.profileImage || getDefaultAvatar()}
            alt={user.fullName}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-gray-950 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400">
                  <BadgeCheck size={12} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  <ShieldAlert size={12} /> Email not verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Member since {formatDate(user.createdAt)}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5">
              {fields.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  {f.icon && <f.icon size={15} className="text-gray-400 mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpen size={18} /> Course Enrollments
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
            {enrollments.length}
          </span>
        </h3>

        {enrollments.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No enrollments yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((e) => (
              <Card key={e._id} className="overflow-hidden">
                {e.workshop ? (
                  <Link href={`/workshop/${e.workshop.slug}`} target="_blank" className="block">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img src={e.workshop.thumbnail} alt={e.workshop.title} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{e.workshop.category}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{e.workshop.level}</span>
                      </div>
                      <h4 className="font-bold line-clamp-2">{e.workshop.title}</h4>
                      <p className="text-xs text-muted-foreground mt-2">Enrolled {formatDate(e.createdAt)}</p>
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-4 text-sm text-muted-foreground">Course was deleted</CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
