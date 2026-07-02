"use client";
import { useState, useEffect, useCallback } from "react";
import { blogPosts as staticPosts, type BlogPost } from "@/data/blog";

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(staticPosts);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.posts?.length > 0) setPosts(data.posts);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { posts, loading, refetch };
}

/**
 * Fetch a single published blog post by id from the public API.
 * Returns `{ post: null, loading: true }` while fetching, then the
 * matching BlogPost (with `content`/`contentAr` populated) or `null`
 * if not found. Callers can fall back to the static `getBlogPost(id)`
 * if `post` is `null` and `loading` is `false`.
 */
export function useBlogPost(id: number | string | undefined) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (id === undefined || id === null || id === "") {
      setPost(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/blog", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const list: BlogPost[] = Array.isArray(data.posts) ? data.posts : [];
      const found = list.find((p) => String(p.id) === String(id));
      setPost(found ?? null);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { post, loading, refetch };
}
