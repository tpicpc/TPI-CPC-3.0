"use client";

import FlipWords from "@/components/FlipWords";
import JoinButton from "@/components/JoinButton";
import { useUser } from "@/contexts/UserContext";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Hero() {
  const { userData } = useUser();
  return (
    <section className="pt-20">
      <div className="flex flex-col items-center text-center">
        <span className="text-sm sm:text-base font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">
          Welcome to TPI CPC
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
          Here at TPI CPC, you will Learn
        </h1>
        <div className="mt-5 h-14 md:h-16 flex items-center justify-center">
          <FlipWords
            words={[
              "Skill Development",
              "Problem Solving",
              "Networking",
              "Career Growth",
              "Competitions",
              "Teamwork",
              "Leadership",
              "Communication",
              "Innovation",
              "Critical Thinking",
              "Coding",
            ]}
          />
        </div>
        <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          At TPI CPC, we bring together technology-loving students where everyone can learn something new, write code, and reach new heights in the programming world. We organize competitions, workshops, and various innovative activities to help our members grow.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {userData ? (
            <JoinButton size="lg" href="/dashboard" label="Go to your dashboard" />
          ) : (
            <JoinButton size="lg" label="Join TPI CPC" />
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="outline" className="h-12 px-6 rounded-full text-base">
                <a target="_blank" href="https://web.facebook.com/groups/tpicpc" rel="noopener noreferrer">
                  <Facebook size={17} className="mr-2 text-[#1877F2]" /> Join our community
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Join our official Facebook group</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" className="h-12 px-5 rounded-full text-base">
                <a target="_blank" href="https://web.facebook.com/TPICPCThakurgonPolytechnicInstitute" rel="noopener noreferrer">Follow us</a>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Follow our official Facebook page</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
    </section>
  );
}
