"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-provider";
import { toast } from "sonner";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const { locale } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSignUp = mode === "signup";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/account/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to complete your request.");
      toast.success(isSignUp ? "Account created successfully." : "Signed in successfully.");
      router.push("/account");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete your request.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = isSignUp ? (locale === "ar" ? "إنشاء حساب" : "Create Account") : (locale === "ar" ? "تسجيل الدخول" : "Sign In");

  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:py-20">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignUp
            ? (locale === "ar" ? "أنشئ حسابك لتتبع طلباتك وحفظ مفضلاتك." : "Create an account to track orders and save your favourites.")
            : (locale === "ar" ? "أدخل بياناتك للوصول إلى حسابك." : "Enter your details to access your account.")}
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">{locale === "ar" ? "الاسم" : "Name"}</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{locale === "ar" ? "البريد الإلكتروني" : "Email address"}</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{locale === "ar" ? "كلمة المرور" : "Password"}</Label>
            <Input id="password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignUp ? "new-password" : "current-password"} required />
            {isSignUp && <p className="text-xs text-muted-foreground">{locale === "ar" ? "8 أحرف على الأقل." : "Use at least 8 characters."}</p>}
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-full">
            {submitting ? (locale === "ar" ? "جارٍ الإرسال..." : "Please wait...") : title}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? (locale === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?") : (locale === "ar" ? "ليس لديك حساب؟" : "New to Modave?")}{" "}
          <Link href={isSignUp ? "/account/login" : "/account/register"} className="font-medium text-foreground underline underline-offset-4">
            {isSignUp ? (locale === "ar" ? "تسجيل الدخول" : "Sign In") : (locale === "ar" ? "إنشاء حساب" : "Create Account")}
          </Link>
        </p>
      </div>
    </div>
  );
}
