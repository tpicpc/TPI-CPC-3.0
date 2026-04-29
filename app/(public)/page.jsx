"use client";

import AboutSection from "@/components/AboutSection";
import AdvisorCard from "@/components/AdvisorCard";
import ContactSection from "@/components/ContactSection";
import Counter from "@/components/Counter";
import EventCard from "@/components/EventCard";
import Hero from "@/components/Hero";
import HomeFAQs from "@/components/HomeFAQs";
import SectionTitle from "@/components/SectionTitle";
import TeamMember from "@/components/TeamMember";
import WhyJoin from "@/components/WhyJoin";
import { Button } from "@/components/ui/button";
import { useHomeData } from "@/contexts/HomeDataContext";
import { formatDate, sortMembers } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  const { data } = useHomeData();
  const year = data?.currentTeamYear || new Date().getFullYear();
  const teams = sortMembers(data?.teamMembers || []);
  const advisors = data?.advisors || [];
  const events = (data?.events || []).slice(0, 6);
  const blogs = (data?.blogs || []).slice(0, 3);
  const reviews = (data?.reviews || []).slice(0, 6);

  return (
    <div className="px-4 md:px-10 container mx-auto">
      <Hero />
      <Counter />
      <AboutSection />
      <WhyJoin />

      <section className="py-16">
        <SectionTitle
          title="Meet Our Advisors"
          subtitle="Learn from experienced mentors who guide you every step. Gain knowledge, inspiration, and support to grow your skills and career."
        />
        {advisors.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Advisors will be announced soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {advisors.map((a) => <AdvisorCard key={a._id} advisor={a} />)}
          </div>
        )}
      </section>

      <section className="py-16">
        <SectionTitle
          title={`Meet Our Team Members ${year}`}
          subtitle="Meet our talented team. Each member brings passion, creativity, and dedication. Together, we learn, collaborate, and create amazing things."
        />
        {teams.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Team members will appear here once added.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {teams.slice(0, 8).map((m) => <TeamMember key={m._id} member={m} />)}
            </div>
            <div className="text-center mt-8">
              <Link href="/teams"><Button>View All Members</Button></Link>
            </div>
          </>
        )}
      </section>

      <section className="py-16">
        <SectionTitle
          title="Our Events"
          subtitle="Dive into exciting coding contests, workshops, and webinars. Join TPI CPC events to learn, innovate, and level up your tech skills."
        />
        {events.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No events to show yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((e) => <EventCard key={e._id} event={e} layout="horizontal" />)}
            </div>
            <div className="text-center mt-8">
              <Link href="/events"><Button>View All Events</Button></Link>
            </div>
          </>
        )}
      </section>

      <section className="py-16">
        <SectionTitle
          title="Our Blogs"
          subtitle="Explore insightful articles, coding tips, and tech updates. Stay updated and level up your skills with TPI CPC blogs."
        />
        {blogs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Blogs coming soon.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {blogs.map((b) => (
                <Link key={b._id} href={`/blogs/${b._id}`} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white dark:hover:bg-white/10 transition">
                  <img src={b.image} alt={b.title} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{b.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDate(b.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/blogs"><Button>View All Blogs</Button></Link>
            </div>
          </>
        )}
      </section>

      <section className="py-16">
        <SectionTitle
          title="Our Student Reviews"
          subtitle="See what our students are saying about us. Their experiences, feedback, and success stories inspire us to grow and improve every day."
        />
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No reviews yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <div key={r._id} className="rounded-xl border border-gray-200 dark:border-white/10 p-5 bg-white/70 dark:bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {r.profileImage ? (
                      <img src={r.profileImage} alt={r.fullName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                        {r.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{r.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.department} · {r.semester} sem</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-5">{r.reviewMessage}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link href="/testimonials"><Button variant="outline">Read all reviews</Button></Link>
              <Link href="/add-review">
                <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
                  Share Your Review
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      <HomeFAQs />
      <ContactSection />
    </div>
  );
}
