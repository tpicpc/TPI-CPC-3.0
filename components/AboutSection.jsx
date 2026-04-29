"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SectionTitle from "@/components/SectionTitle";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 px-4 md:px-10 container mx-auto">
      <SectionTitle title="About TPI CPC" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/4i9mrA8kvHo?rel=0&modestbranding=1&playsinline=1"
            title="TPI CPC Intro"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="space-y-5">
          <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-200">
            <span className="font-semibold text-gray-900 dark:text-white">TPI CPC</span> is a vibrant community of students who love coding, problem-solving, and innovation. Our mission is to build a collaborative space where learners can sharpen their skills, explore new technologies, and prepare for real-world challenges.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-200">
            We host <strong className="text-gray-900 dark:text-white">workshops, seminars, hackathons,</strong> and <strong className="text-gray-900 dark:text-white">coding contests</strong> to inspire our members. From skill growth and leadership to career opportunities and networking, TPI CPC helps every student shine.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://web.facebook.com/groups/tpicpc" target="_blank" rel="noopener noreferrer">
                  <Button variant="destructive">Join Our Community</Button>
                </a>
              </TooltipTrigger>
              <TooltipContent><p>Join our official Facebook community</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://web.facebook.com/TPICPCThakurgonPolytechnicInstitute" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">Follow Us</Button>
                </a>
              </TooltipTrigger>
              <TooltipContent><p>Follow our official Facebook page</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </section>
  );
}
