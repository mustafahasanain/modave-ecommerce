"use client";

import { useState, useEffect, useCallback } from "react";

export interface Review {
  id: string;
  productId: number;
  author: string;
  email: string | null;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: string;
}

interface UseReviews {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  submitReview: (data: {
    author: string;
    email?: string;
    rating: number;
    title?: string;
    body: string;
  }) => Promise<boolean>;
}

export function useReviews(productId: number | null): UseReviews {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (productId == null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const submitReview: UseReviews["submitReview"] = useCallback(
    async (data) => {
      if (productId == null) return false;
      try {
        const res = await fetch(`/api/products/${productId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to submit review");
        await refetch();
        return true;
      } catch {
        return false;
      }
    },
    [productId, refetch]
  );

  return { reviews, loading, error, refetch, submitReview };
}
