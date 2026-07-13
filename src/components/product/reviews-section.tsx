"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, User, X } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useReviews } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ReviewsSectionProps {
  productId: number;
  productRating: number;
  productReviewsCount: number;
}

type SortKey = "recent" | "highest" | "lowest";

export function ReviewsSection({ productId, productRating, productReviewsCount }: ReviewsSectionProps) {
  const { locale } = useLanguage();
  const { reviews, loading, submitReview } = useReviews(productId);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author: "", email: "", rating: 5, title: "", body: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("recent");

  const ar = locale === "ar";

  const avgFromDb =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : productRating;
  const totalCount = productReviewsCount + reviews.length;

  // Distribution — spread the aggregate rating count across star buckets so the
  // bars stay meaningful even before individual comments have loaded.
  const dist = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map(
      (star) => reviews.filter((r) => r.rating === star).length
    );
    const max = Math.max(1, ...counts);
    return [5, 4, 3, 2, 1].map((star, i) => ({
      star,
      count: counts[i],
      pct: (counts[i] / max) * 100,
    }));
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    switch (sort) {
      case "highest":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        list.sort((a, b) => a.rating - b.rating);
        break;
      default:
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list;
  }, [reviews, sort]);

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

  const relativeDays = (iso: string) => {
    const days = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
    return ar ? `منذ ${days} يوم` : `${days} days ago`;
  };

  const commentCount = String(reviews.length).padStart(2, "0");

  return (
    <div className="rounded-xl border border-border p-6 sm:p-8 lg:p-10">
      {/* ===== Summary ===== */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-start gap-x-12 gap-y-6">
          {/* Average */}
          <div>
            <p className="font-display text-6xl font-semibold leading-none">
              {avgFromDb.toFixed(1)}
            </p>
            <div className="mt-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avgFromDb)
                      ? "fill-foreground text-foreground"
                      : "fill-border text-border"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground">
              ({totalCount} {ar ? "تقييم" : "Ratings"})
            </p>
          </div>

          {/* Distribution */}
          <div className="min-w-[240px] flex-1 space-y-2.5 sm:min-w-[320px]">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-sm">
                <span className="flex w-6 items-center gap-1 text-foreground">
                  {d.star}
                  <Star className="h-3 w-3 fill-foreground text-foreground" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-6 text-end text-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write a review */}
        <Button
          onClick={() => setShowForm((p) => !p)}
          variant="outline"
          className="h-11 shrink-0 rounded-md px-6 text-xs font-semibold uppercase tracking-widest"
        >
          {ar ? "اكتب تقييماً" : "Write a review"}
        </Button>
      </div>

      {/* ===== Submit form ===== */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="mt-8 overflow-hidden rounded-xl border border-border bg-secondary/30 p-5"
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
                            ? "fill-foreground text-foreground"
                            : "fill-border text-border"
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

      {/* ===== Comments ===== */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl font-semibold tracking-tight">
          {commentCount} {ar ? "تعليق" : "Comments"}
        </h3>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {ar ? "ترتيب حسب" : "Sort by"}:
          </span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-40 rounded-md text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{ar ? "الأحدث" : "Most Recent"}</SelectItem>
              <SelectItem value="highest">{ar ? "الأعلى تقييماً" : "Highest Rating"}</SelectItem>
              <SelectItem value="lowest">{ar ? "الأدنى تقييماً" : "Lowest Rating"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comment list */}
      <div className="mt-8 space-y-10">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-64 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-full animate-pulse rounded bg-secondary" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
            </div>
          ))
        ) : sortedReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {ar
              ? "لا توجد تعليقات بعد. كن أول من يشارك رأيه!"
              : "No comments yet. Be the first to share your thoughts!"}
          </p>
        ) : (
          sortedReviews.map((r, index) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Comment head */}
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <User className="h-5 w-5" />
                </span>
                <div className="min-w-0 pt-1">
                  <h4 className="font-medium">{r.title || r.author}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {relativeDays(r.createdAt)} <span className="mx-1">–</span>
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>

              {/* Store reply (shown on the first comment, mirroring the theme) */}
              {index === 0 && (
                <div className="mt-6 border-s border-border ps-6 sm:ms-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground font-display text-lg font-bold text-background">
                      M
                    </span>
                    <div className="min-w-0 pt-1">
                      <h4 className="font-medium">{ar ? "رد من Modave" : "Reply from Modave"}</h4>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {relativeDays(r.createdAt)} <span className="mx-1">–</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {ar
                      ? "يسعدنا سماع ذلك! نحب أن نمكّن أصحاب المتاجر من بناء موقع جميل دون الحاجة لمطوّر. شكراً لك على هذا التقييم الرائع!"
                      : "We love to hear it! Part of what we love most about Modave is how much it empowers store owners like yourself to build a beautiful website without having to hire a developer :) Thank you for this fantastic review!"}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
