"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, Store } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function LoginForm() {
  const { locale, dir } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const ar = locale === "ar";
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(ar ? "تم تسجيل الدخول بنجاح" : "Login successful");
        router.push(from);
        router.refresh();
      } else {
        toast.error(data.error || (ar ? "فشل تسجيل الدخول" : "Login failed"));
      }
    } catch {
      toast.error(ar ? "حدث خطأ" : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-3xl font-semibold tracking-tight">Modave</span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            {ar ? "لوحة تحكم المدير" : "Admin Dashboard"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold">
                {ar ? "تسجيل الدخول" : "Sign In"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {ar ? "ادخل بياناتك للوصول إلى لوحة التحكم" : "Enter your credentials to access the dashboard"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest">
                {ar ? "البريد الإلكتروني" : "Email"}
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="ps-9"
                  placeholder="admin@modave.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest">
                {ar ? "كلمة المرور" : "Password"}
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="ps-9 pe-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2 rounded-full" size="lg">
              {loading
                ? ar ? "جارٍ الدخول..." : "Signing in..."
                : ar ? "دخول" : "Sign In"}
              {!loading && <Arrow className="h-4 w-4 rtl-flip" />}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 rounded-lg bg-secondary/60 p-3 text-center text-xs text-muted-foreground">
            <p className="font-medium">{ar ? "بيانات تجريبية" : "Demo credentials"}</p>
            <p className="mt-0.5 font-mono">admin@modave.com / admin123</p>
          </div>
        </div>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Store className="h-3.5 w-3.5" />
            {ar ? "العودة إلى المتجر" : "Back to store"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
