"use client";

import { counterNumber } from "@/lib/assets";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

export default function Counter() {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-12 px-4 md:px-10 container mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {counterNumber.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-6 text-center"
          >
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {c.text ? c.text : visible ? <CountUp end={c.value} duration={2.2} suffix={c.suffix || ""} /> : "0"}
            </div>
            <p className="mt-2 text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">{c.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
