/* eslint-disable @next/next/no-img-element */
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import CommentsSection from "@/components/blog/CommentsSection";
import LikeButton from "@/components/blog/LikeButton";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ViewBeacon from "@/components/blog/ViewBeacon";
import ShareBar from "@/components/blog/ShareBar";
import { excerpt, readingTime } from "@/lib/blog-content";
import { articleSerif } from "@/lib/fonts";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

function AuthorName({ author, className = "" }) {
  if (author?.username) {
    return (
      <Link href={`/members/${author.username}`} className={`hover:underline underline-offset-4 ${className}`}>
        {author.name}
      </Link>
    );
  }
  return <span className={className}>{author?.name || "TPI CPC"}</span>;
}

function Tag({ tag }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-gray-300 px-3.5 py-1.5 text-sm">
      {tag}
    </span>
  );
}

/**
 * Medium-style article layout. Presentational only: `html` must already be sanitized.
 * Used by the public detail page (server), the preview fallback and the editor preview.
 */
export default function ArticleView({ blog, author, html, related = [], preview = false }) {
  const minutes = readingTime(html);
  const tags = (blog.tags || []).filter(Boolean);
  const date = blog.approvedAt || blog.createdAt;
  const path = blog._id ? `/blogs/${blog.slug || blog._id}` : "/blogs";

  return (
    <div className={`${articleSerif.variable} bg-background`}>
      {!preview && <ReadingProgress />}
      {!preview && <ViewBeacon id={String(blog._id)} />}
      <article className="pb-6">
        <header className="mx-auto max-w-[728px] px-5 sm:px-6 pt-8 md:pt-14">
          {!preview && (
            <div className="flex items-center gap-3 text-sm mb-8">
              <Link href="/blogs" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                <ArrowLeft size={15} /> All posts
              </Link>
              {tags[0] && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{tags[0]}</span>
                </>
              )}
            </div>
          )}

          <h1 className="font-article text-[32px] leading-[1.2] sm:text-[40px] md:text-[44px] md:leading-[1.15] font-bold tracking-[-0.016em] text-gray-950 dark:text-white break-words">
            {blog.title || "Untitled story"}
          </h1>
          {blog.subtitle && (
            <p className="font-article mt-3 text-[20px] md:text-[22px] leading-snug text-gray-500 dark:text-gray-400">{blog.subtitle}</p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <AuthorAvatar author={author} size={44} />
            <div className="min-w-0">
              <AuthorName author={author} className="block font-medium text-[15px] text-gray-900 dark:text-gray-100 truncate" />
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1"><Clock size={13} /> {minutes} min read</span>
                <span aria-hidden="true">·</span>
                <time dateTime={date ? new Date(date).toISOString() : undefined}>{date ? formatDate(date) : "Draft"}</time>
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between border-y border-gray-200/80 dark:border-white/10 py-1.5">
            {preview ? (
              <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pl-1">
                <img src="/tpicpc_logo.png" alt="" className="h-5 w-auto object-contain" />
                <span className="hidden sm:inline">Published in TPI CPC Blog</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <LikeButton blogId={blog._id} initialCount={blog.likeCount || 0} />
                <a href="#responses" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition" aria-label="Jump to responses">
                  <MessageCircle size={18} /> <span className="tabular-nums font-medium">{blog.commentCount || 0}</span>
                </a>
              </span>
            )}
            {preview ? <span className="text-xs uppercase tracking-wider text-gray-400 pr-2">Preview</span> : <ShareBar title={blog.title} path={path} />}
          </div>
        </header>

        {blog.image && (
          <figure className="mx-auto max-w-[1040px] mt-8 md:mt-10 sm:px-6">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[560px] object-cover sm:rounded-xl bg-gray-100 dark:bg-white/5"
            />
          </figure>
        )}

        <div
          id="article-body"
          className="article-content font-article mx-auto max-w-[728px] px-5 sm:px-6 mt-8 md:mt-12"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mx-auto max-w-[728px] px-5 sm:px-6 mt-12">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => <Tag key={t} tag={t} />)}
            </div>
          )}

          {!preview && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <LikeButton blogId={blog._id} initialCount={blog.likeCount || 0} size="lg" />
                <span className="hidden sm:inline text-sm text-gray-500">Enjoyed it? Leave a like.</span>
              </span>
              <ShareBar title={blog.title} path={path} />
            </div>
          )}

          <div className="mt-8 border-t border-gray-200/80 dark:border-white/10 pt-8 flex items-start gap-4">
            <AuthorAvatar author={author} size={64} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-500">Written by</p>
              <AuthorName author={author} className="block mt-1 text-xl font-semibold text-gray-950 dark:text-white" />
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {author?.isClub
                  ? "Thakurgaon Polytechnic Institute Computer & Programming Club — workshops, contests and stories from our community."
                  : "Member of the TPI CPC community. Want to share what you've learned too?"}
              </p>
              {!preview && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {author?.username && (
                    <Link href={`/members/${author.username}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      View profile
                    </Link>
                  )}
                  <Link href="/submit-blog" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    Write a story
                  </Link>
                </div>
              )}
            </div>
          </div>
        </footer>
      </article>

      {!preview && blog._id && <CommentsSection blogId={blog._id} initialCount={blog.commentCount || 0} />}

      {related.length > 0 && (
        <section className="mt-12 border-t border-gray-200/80 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-[1040px] px-5 sm:px-6 py-12 md:py-16">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-950 dark:text-white">More from TPI CPC</h2>
              <Link href="/blogs" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                See all posts <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link key={r._id} href={`/blogs/${r.slug || r._id}`} className="group block">
                  <div className="aspect-[16/10] overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
                    {r.image && (
                      <img src={r.image} alt={r.title} loading="lazy" className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    )}
                  </div>
                  {r.tags?.[0] && <p className="mt-4 text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{r.tags[0]}</p>}
                  <h3 className="mt-1.5 font-article text-lg font-bold leading-snug text-gray-950 dark:text-white line-clamp-2 group-hover:underline underline-offset-4">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{r.subtitle || excerpt(r.description, 140)}</p>
                  <p className="mt-3 text-xs text-gray-500">
                    {r.author || "TPI CPC"} · {readingTime(r.description)} min read · {formatDate(r.approvedAt || r.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
