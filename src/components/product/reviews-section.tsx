"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Check, X } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useReviews } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReviewsSectionProps {
  productId: number;
  productRating: number;
  productReviewsCount: number;
}

export function ReviewsSection({ productId, productRating, productReviewsCount }: ReviewsSectionProps) {
  const { locale } = useLanguage();
  const { reviews, loading, submitReview } = useReviews(productId);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author: "", email: "", rating: 5, title: "", body: "" });
  const [hoverRating, setHoverRating] = useState(0);

  const ar = locale === "ar";

  const avgFromDb =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : productRating;
  const totalCount = productReviewsCount + reviews.length;

  // Distribution
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.body.trim()) {
      toast.error(ar ? "يرجى تعبئة الاسم والتعليق" : "Please fill in your name and review");
      return;
    }
    setSubmitting(true);
    const ok = await submitReview({
      author: form.author.trim(),
      email: form.email.trim() || undefined,
      rating: form.rating,
      title: form.title.trim() || undefined,
      body: form.body.trim(),
    });
    setSubmitting(false);
    if (ok) {
      toast.success(ar ? "شكراً! تم نشر تعليقك" : "Thank you! Your review has been posted");
      setForm({ author: "", email: "", rating: 5, title: "", body: "" });
      setShowForm(false);
    } else {
      toast.error(ar ? "فشل إرسال التعليق" : "Failed to submit review");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(ar ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="mt-6 max-w-3xl">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-8 rounded-xl border border-border bg-secondary/30 p-6">
        <div className="text-center">
          <p className="font-display text-5xl font-semibold">{avgFromDb.toFixed(1)}</p>
          <div className="mt-1 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(avgFromDb) ? "fill-amber-400 text-amber-400" : "text-border"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{totalCount} {ar ? "تقييم" : "reviews"}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="w-3">{d.star}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-8 text-end text-muted-foreground">{d.count}</span>
            </div>
          ))}
        </div>
        <Button onClick={() => setShowForm((p) => !p)} variant="outline" className="rounded-full">
          <MessageSquare className="h-4 w-4" />
          {ar ? "اكتب تعليقاً" : "Write a review"}
        </Button>
      </div>

      {/* Submit form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="mt-4 overflow-hidden rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold">
                {ar ? "شارك رأيك" : "Share your thoughts"}
              </h4>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rating selector */}
            <div className="mb-4">
              <Label className="mb-2 block text-xs uppercase tracking-wider">
                {ar ? "تقييمك" : "Your rating"}
              </Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: val }))}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5"
                      aria-label={`${val} stars`}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          val <= (hoverRating || form.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-border"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">
                  {ar ? "الاسم *" : "Name *"}
                </Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  required
                  placeholder={ar ? "اسمك" : "Your name"}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider">
                  {ar ? "البريد (اختياري)" : "Email (optional)"}
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="mt-3">
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">
                {ar ? "العنوان" : "Title"}
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={ar ? "ملخص قصير" : "A short summary"}
              />
            </div>
            <div className="mt-3">
              <Label className="mb-1.5 block text-xs uppercase tracking-wider">
                {ar ? "التعليق *" : "Review *"}
              </Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                required
                rows={4}
                placeholder={ar ? "شارك تفاصيل تجربتك..." : "Share details of your experience..."}
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {ar ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (ar ? "جارٍ الإرسال..." : "Submitting...") : ar ? "نشر التعليق" : "Submit review"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
                <div className="mt-2 h-2.5 w-full animate-pulse rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {ar
              ? "لا توجد تعليقات بعد. كن أول من يشارك رأيه!"
              : "No reviews yet. Be the first to share your thoughts!"}
          </div>
        ) : (
          reviews.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      {r.author}
                      {r.verified && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                          <Check className="h-2.5 w-2.5" />
                          {ar ? "موثّق" : "Verified"}
                        </span>
                      )}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {r.title && (
                <h5 className="mt-3 text-sm font-semibold">{r.title}</h5>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
