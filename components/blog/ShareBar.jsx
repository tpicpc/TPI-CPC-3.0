"use client";

import { Check, Facebook, Link2, Linkedin, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function XIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const btn =
  "inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

/** Share / copy-link actions for an article. `path` is the article path (e.g. /blogs/123). */
export default function ShareBar({ title, path, compact = false }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setUrl(new URL(path, window.location.origin).toString());
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [path]);

  const enc = encodeURIComponent;
  const links = [
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, icon: <XIcon size={15} /> },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: <Facebook size={17} /> },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: <Linkedin size={17} /> },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="flex items-center gap-0.5" aria-label="Share this article">
      {!compact &&
        links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={btn} title={l.label} aria-label={l.label}>
            {l.icon}
          </a>
        ))}
      <button type="button" onClick={copy} className={btn} title="Copy link" aria-label="Copy link">
        {copied ? <Check size={17} className="text-emerald-500" /> : <Link2 size={17} />}
      </button>
      {canShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          className={btn}
          title="Share"
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
      )}
    </div>
  );
}
