"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

export default function FlipWords({ words, duration = 3000, className }) {
  const [current, setCurrent] = useState(words[0]);
  const [transitioning, setTransitioning] = useState(false);

  const next = useCallback(() => {
    const idx = words.indexOf(current);
    const upcoming = words[idx + 1] || words[0];
    setCurrent(upcoming);
    setTransitioning(true);
  }, [current, words]);

  useEffect(() => {
    if (transitioning) return;
    const t = setTimeout(next, duration);
    return () => clearTimeout(t);
  }, [transitioning, duration, next]);

  return (
    <AnimatePresence onExitComplete={() => setTransitioning(false)}>
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.8 }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
          transition: { type: "spring", stiffness: 200, damping: 20, duration: 0.4 },
        }}
        className={cn(
          "z-10 inline-block relative px-2 font-extrabold text-indigo-600 dark:text-indigo-400 text-3xl md:text-4xl lg:text-5xl text-center",
          className
        )}
      >
        {current.split(" ").map((word, wordIdx) => (
          <motion.span
            key={word + wordIdx}
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: wordIdx * 0.3,
              duration: 0.4,
              type: "spring",
              stiffness: 120,
              damping: 12,
            }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((char, charIdx) => (
              <motion.span
                key={word + charIdx}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIdx * 0.3 + charIdx * 0.05,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 140,
                  damping: 14,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
