"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock, ChevronRight, Calendar } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { getBlogPost, type BlogPost } from "@/data/blog";
import { useBlogPost, useBlogPosts } from "@/hooks/use-blog-posts";

function renderContent(content: string | undefined) {
  if (!content || !content.trim()) {
    return null;
  }
  const lines = content
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-2xl font-semibold text-foreground">
          {line.slice(3).trim()}
        </h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h2 key={i} className="font-display text-2xl font-semibold text-foreground">
          {line.slice(2).trim()}
        </h2>
      );
    }
    if (line.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          className="border-s-4 border-foreground ps-5 font-display text-lg italic text-foreground"
        >
          {line.replace(/^>\s?/, "").trim()}
        </blockquote>
      );
    }
    return <p key={i}>{line}</p>;
  });
}

export default function BlogPostPage() {
  const { t, locale, dir } = useLanguage();
  const params = useParams();
  const id = Number(params.id);
  const staticPost = getBlogPost(id);
  const { post: dbPost, loading } = useBlogPost(Number.isNaN(id) ? undefined : id);
  const { posts: blogPosts } = useBlogPosts();

  // Prefer DB record (it has the real content); fall back to static data.
  const post: BlogPost | undefined = dbPost ?? staticPost;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  if (!post) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-semibold">Article not found</h1>
        <Link href="/blog" className="text-sm font-medium underline">
          {t.blog.back}
        </Link>
      </div>
    );
  }

  const title = locale === "ar" ? post.titleAr : post.title;
  const excerpt = locale === "ar" ? post.excerptAr : post.excerpt;
  const category = locale === "ar" ? post.categoryAr : post.category;
  const author = locale === "ar" ? post.authorAr : post.author;
  const rawContent = locale === "ar" ? post.contentAr : post.content;
  const hasContent = !!rawContent && !!rawContent.trim();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  const fallbackRelated = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);
  const relatedPosts = related.length >= 2 ? related : fallbackRelated;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">{t.common.home}</Link>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <Link href="/blog" className="hover:text-foreground transition-colors">{t.blog.title}</Link>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <span className="line-clamp-1 text-foreground">{title}</span>
      </nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-3 py-1 font-semibold uppercase tracking-wider text-foreground">
            {category}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime} {t.blog.minRead}
          </span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">{excerpt}</p>
        <div className="mt-5 flex items-center gap-3 border-y border-border py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
            {author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{author}</p>
            <p className="text-xs text-muted-foreground">
              {locale === "ar" ? "كاتب في موديف" : "Writer at Modave"}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Cover image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-secondary"
      >
        <Image
          src={post.image}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </motion.div>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/80 sm:text-base"
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        ) : hasContent ? (
          renderContent(rawContent)
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-8 text-center text-muted-foreground">
            {locale === "ar"
              ? "محتوى هذه المقالة غير متاح حالياً. يرجى العودة لاحقاً."
              : "Content for this article is not available yet. Please check back later."}
          </p>
        )}
      </motion.div>

      {/* Share + back */}
      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <Arrow className="h-3.5 w-3.5 rotate-180 rtl-flip" />
          {t.blog.back}
        </Link>
        <div className="flex items-center gap-2">
          {["Facebook", "Twitter", "Instagram"].map((s) => (
            <a
              key={s}
              href="#"
              className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {t.blog.relatedPosts}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((rp, i) => (
              <motion.div
                key={rp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link href={`/blog/${rp.id}`} className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <Image
                      src={rp.image}
                      alt={locale === "ar" ? rp.titleAr : rp.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {locale === "ar" ? rp.categoryAr : rp.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-foreground/70">
                      {locale === "ar" ? rp.titleAr : rp.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
