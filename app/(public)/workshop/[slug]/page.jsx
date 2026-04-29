"use client";

import { ListRowSkeleton, PlayerSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { youtubeEmbedUrl } from "@/lib/youtube";
import axios from "axios";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, GraduationCap, Lock, LogIn, PlayCircle, Repeat, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { userData, loading: userLoading } = useUser();
  const [workshop, setWorkshop] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [watched, setWatched] = useState(new Set());
  const iframeRef = useRef(null);

  const fetchCourse = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`/api/v1/workshop/${slug}`, { headers });
      if (data.success) {
        setWorkshop(data.workshop);
        setEnrolled(data.enrolled);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, userData]);

  const lessons = workshop?.lessons || [];
  const lessonCount = lessons.length;
  const activeLesson = lessons[activeIdx];
  const isComingSoon = workshop?.status === "ComingSoon";

  const playerSrc = useMemo(() => {
    if (!workshop || !enrolled) return null;
    const base = activeLesson?.videoUrl
      ? youtubeEmbedUrl(activeLesson.videoUrl)
      : workshop.playlistUrl
      ? youtubeEmbedUrl(workshop.playlistUrl)
      : null;
    if (!base) return null;
    const u = new URL(base);
    u.searchParams.set("enablejsapi", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("modestbranding", "1");
    u.searchParams.set("playsinline", "1");
    if (activeIdx > 0 || watched.has(activeIdx)) u.searchParams.set("autoplay", "1");
    u.searchParams.set("origin", typeof window !== "undefined" ? window.location.origin : "");
    return u.toString();
  }, [workshop, activeLesson, activeIdx, watched, enrolled]);

  useEffect(() => {
    if (!autoplay || !enrolled) return;
    const onMessage = (e) => {
      if (typeof e.data !== "string") return;
      try {
        const msg = JSON.parse(e.data);
        if (msg?.info?.playerState === 0) {
          if (activeIdx < lessonCount - 1) {
            setWatched((s) => new Set(s).add(activeIdx));
            setActiveIdx(activeIdx + 1);
          }
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [autoplay, activeIdx, lessonCount, enrolled]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const send = () => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }), "*");
    };
    iframe.addEventListener("load", send);
    return () => iframe.removeEventListener("load", send);
  }, [playerSrc]);

  const onEnroll = async () => {
    if (!userData) {
      router.push(`/login?redirect=/workshop/${slug}`);
      return;
    }
    setEnrolling(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `/api/v1/workshop/${slug}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message || "Enrolled — check your email");
        await fetchCourse();
      } else {
        toast.error(data.message || "Enrollment failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const goPrev = () => activeIdx > 0 && setActiveIdx(activeIdx - 1);
  const goNext = () => {
    setWatched((s) => new Set(s).add(activeIdx));
    if (activeIdx < lessonCount - 1) setActiveIdx(activeIdx + 1);
  };

  if (loading) return (
    <div className="px-4 md:px-10 container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2"><PlayerSkeleton /></div>
      <div className="space-y-3">
        <ListRowSkeleton /><ListRowSkeleton /><ListRowSkeleton />
      </div>
    </div>
  );
  if (!workshop) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Course not found.</div>;

  const nextLesson = lessons[activeIdx + 1];
  const showLockedPlayer = !enrolled && !isComingSoon;

  return (
    <div className="px-4 md:px-10 container mx-auto py-10">
      <Link href="/workshop" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Player or locked preview */}
          <div className="aspect-video rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-white/10 relative">
            {enrolled && playerSrc ? (
              <iframe
                ref={iframeRef}
                key={playerSrc}
                src={playerSrc}
                title={activeLesson?.title || workshop.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <>
                {workshop.thumbnail && (
                  <img src={workshop.thumbnail} alt={workshop.title} className="w-full h-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  {isComingSoon ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                        <Clock size={26} className="text-amber-400" />
                      </div>
                      <p className="text-white font-bold text-lg">Coming Soon</p>
                      <p className="text-white/70 text-sm mt-1">This course will be available shortly.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-3">
                        <Lock size={24} className="text-white" />
                      </div>
                      <p className="text-white font-bold text-lg">Enroll to unlock the lessons</p>
                      <p className="text-white/70 text-sm mt-1 max-w-md">
                        Join thousands of learners — get full access to every video, free of charge.
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Player controls — only when enrolled */}
          {enrolled && lessonCount > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/[0.04] dark:to-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm">
              {/* Progress dots */}
              <div className="px-4 pt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  {lessons.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      title={`Lesson ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIdx
                          ? "flex-[3] bg-gradient-to-r from-indigo-500 to-violet-500"
                          : watched.has(i)
                          ? "flex-1 bg-green-500/60 hover:bg-green-500"
                          : i < activeIdx
                          ? "flex-1 bg-indigo-300 dark:bg-indigo-400/40"
                          : "flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">
                    Lesson <strong className="text-gray-900 dark:text-white">{activeIdx + 1}</strong>
                    <span className="text-gray-400"> / {lessonCount}</span>
                  </span>
                  {activeLesson?.duration && (
                    <span className="flex items-center gap-1"><Clock size={11} /> {activeLesson.duration}</span>
                  )}
                </div>
              </div>

              {/* Title + button row */}
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-indigo-500 font-bold">Now playing</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{activeLesson?.title || workshop.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={activeIdx === 0}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous lesson"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={activeIdx >= lessonCount - 1}
                    className="h-9 px-4 rounded-full flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-medium shadow shadow-indigo-500/30 hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next lesson"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Bottom strip */}
              <div className="px-4 py-2.5 border-t border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                  <CheckCircle2 size={12} className={watched.size > 0 ? "text-green-500" : "text-gray-400"} />
                  <span>{watched.size} of {lessonCount} watched</span>
                  {nextLesson && (
                    <>
                      <span className="text-gray-400">·</span>
                      <span className="truncate">Up next: <strong className="text-gray-700 dark:text-gray-200">{nextLesson.title}</strong></span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAutoplay(!autoplay)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 h-8 rounded-full transition ${
                    autoplay
                      ? "bg-indigo-500 text-white shadow shadow-indigo-500/30"
                      : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-indigo-400"
                  }`}
                  title="Auto-advance to the next lesson when this video ends"
                >
                  <span className={`relative inline-block w-7 h-4 rounded-full ${autoplay ? "bg-white/30" : "bg-gray-300 dark:bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${autoplay ? "left-3.5" : "left-0.5"}`} />
                  </span>
                  Autoplay
                </button>
              </div>
            </div>
          )}

          {/* Course / lesson details */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs px-2 py-1 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{workshop.category}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">{workshop.level}</span>
              {workshop.tags?.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">#{t}</span>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              {enrolled ? (activeLesson?.title || workshop.title) : workshop.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><User size={14} /> {workshop.instructor}</span>
              <span className="flex items-center gap-1"><BookOpen size={14} /> {lessonCount} lessons</span>
              {enrolled && activeLesson?.duration && <span className="flex items-center gap-1"><Clock size={14} /> {activeLesson.duration}</span>}
            </div>
            <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {enrolled ? (activeLesson?.description || workshop.description) : workshop.description}
            </p>

            {/* Enroll CTA — when not enrolled and course is published */}
            {!enrolled && !isComingSoon && (
              <div className="mt-6 rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                    <GraduationCap className="text-white" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Enroll for free</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {userData
                        ? "One click to unlock the full course. We'll email you a confirmation right away."
                        : "Sign in or create your free account to enroll and start learning."}
                    </p>
                    <Button
                      onClick={onEnroll}
                      disabled={enrolling || userLoading}
                      className="mt-4 h-11 px-6 bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white"
                    >
                      {enrolling ? (
                        "Enrolling..."
                      ) : userData ? (
                        <><GraduationCap size={16} className="mr-2" /> Enroll Now</>
                      ) : (
                        <><LogIn size={16} className="mr-2" /> Sign in to Enroll</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {enrolled && activeLesson?.resources?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold mb-2 text-gray-900 dark:text-white">Resources</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {activeLesson.resources.map((r, i) => (
                    <li key={i}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{r.label || r.url}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {enrolled && nextLesson && (
              <div className="mt-8 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5">
                <p className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold mb-2">Up next</p>
                <h3 className="font-bold text-gray-900 dark:text-white">{nextLesson.title}</h3>
                {nextLesson.duration && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12} /> {nextLesson.duration}</p>}
                <Button onClick={goNext} size="sm" className="mt-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
                  Watch next <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Lesson sidebar */}
        <aside className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden h-fit lg:sticky lg:top-24">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Course Content</h3>
            <p className="text-xs text-gray-500 mt-1">
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
              {enrolled && watched.size > 0 && ` · ${watched.size} watched`}
              {!enrolled && !isComingSoon && " · Preview"}
            </p>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {lessons.map((l, i) => {
              const isActive = enrolled && i === activeIdx;
              const isWatched = watched.has(i);
              return (
                <li key={l._id || i}>
                  <button
                    onClick={() => enrolled && setActiveIdx(i)}
                    disabled={!enrolled}
                    className={`w-full text-left px-5 py-3 border-b border-gray-100 dark:border-white/5 text-sm transition flex items-start gap-3 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-500"
                        : enrolled
                        ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        : "opacity-70 cursor-not-allowed"
                    }`}
                  >
                    <span className="shrink-0 w-6 text-center mt-0.5">
                      {isActive ? (
                        <PlayCircle size={18} className="text-indigo-500" />
                      ) : isWatched ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : !enrolled && !isComingSoon ? (
                        <Lock size={14} className="text-gray-400 mx-auto" />
                      ) : (
                        <span className="text-xs font-medium text-gray-400">{i + 1}</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`line-clamp-2 ${isActive ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                        {l.title}
                      </div>
                      {l.duration && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={11} /> {l.duration}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
            {lessonCount === 0 && enrolled && workshop.playlistUrl && (
              <li className="px-5 py-4 text-sm text-gray-500">Playing full YouTube playlist</li>
            )}
            {lessonCount === 0 && (!enrolled || !workshop.playlistUrl) && (
              <li className="px-5 py-4 text-sm text-gray-500">Course content will be revealed after enrollment.</li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
