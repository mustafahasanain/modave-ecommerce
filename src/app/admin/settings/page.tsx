"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trash2, Loader2, Plus } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ---------- Types ----------
interface HeroSlide {
  id: number;
  image: string;
  eyebrow: string;
  eyebrowAr: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  cta: string;
  ctaAr: string;
  href: string;
  order: number;
  active: boolean;
}
interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  product: string;
  price: string;
  avatar: string;
  order: number;
  active: boolean;
}
interface ShippingOption {
  id: number;
  label: string;
  labelAr: string;
  price: number;
  active: boolean;
}
interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  expiresAt: string | null;
}

const emptyHero: Omit<HeroSlide, "id"> = {
  image: "",
  eyebrow: "",
  eyebrowAr: "",
  title: "",
  titleAr: "",
  subtitle: "",
  subtitleAr: "",
  cta: "Shop Now",
  ctaAr: "تسوّق الآن",
  href: "/shop",
  order: 0,
  active: true,
};
const emptyTestimonial: Omit<Testimonial, "id"> = {
  text: "",
  name: "",
  role: "",
  product: "",
  price: "",
  avatar: "",
  order: 0,
  active: true,
};
const emptyShipping: Omit<ShippingOption, "id"> = {
  label: "",
  labelAr: "",
  price: 0,
  active: true,
};
const emptyCoupon: Omit<Coupon, "id"> = {
  code: "",
  type: "percentage",
  value: 10,
  active: true,
  expiresAt: null,
};

export default function AdminSettingsPage() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [shippingOpts, setShippingOpts] = useState<ShippingOption[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Dialog state
  const [heroOpen, setHeroOpen] = useState(false);
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [heroForm, setHeroForm] = useState(emptyHero);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [shippingForm, setShippingForm] = useState(emptyShipping);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [creating, setCreating] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h, t, sh, c] = await Promise.all([
        fetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/hero", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/testimonials", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/shipping", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/coupons", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setSettings(s.settings || {});
      setHeroSlides(h.slides || []);
      setTestimonials(t.testimonials || []);
      setShippingOpts(sh.options || []);
      setCoupons(c.coupons || []);
    } catch {
      // ignore — keep empty lists
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      toast.success("Settings saved");
    } catch { toast.error("Failed"); }
    setSaving(false);
  }

  async function deleteItem(api: string, id: number | string) {
    try {
      await fetch(`${api}/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      await loadData();
    } catch {
      toast.error("Failed to delete");
    }
  }

  // ---------- Create handlers ----------
  async function createHero() {
    if (!heroForm.title.trim()) { toast.error("Title is required"); return; }
    if (!heroForm.image.trim()) { toast.error("Image URL is required"); return; }
    setCreating("hero");
    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...heroForm,
          order: Number(heroForm.order) || 0,
          active: !!heroForm.active,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      toast.success("Hero slide added");
      setHeroOpen(false);
      setHeroForm(emptyHero);
      await loadData();
    } catch {
      toast.error("Failed to add hero slide");
    } finally {
      setCreating(null);
    }
  }

  async function createTestimonial() {
    if (!testimonialForm.name.trim()) { toast.error("Name is required"); return; }
    if (!testimonialForm.text.trim()) { toast.error("Text is required"); return; }
    setCreating("testimonial");
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...testimonialForm,
          order: Number(testimonialForm.order) || 0,
          active: !!testimonialForm.active,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      toast.success("Testimonial added");
      setTestimonialOpen(false);
      setTestimonialForm(emptyTestimonial);
      await loadData();
    } catch {
      toast.error("Failed to add testimonial");
    } finally {
      setCreating(null);
    }
  }

  async function createShipping() {
    if (!shippingForm.label.trim()) { toast.error("Label is required"); return; }
    setCreating("shipping");
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shippingForm,
          price: Number(shippingForm.price) || 0,
          active: !!shippingForm.active,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      toast.success("Shipping option added");
      setShippingOpen(false);
      setShippingForm(emptyShipping);
      await loadData();
    } catch {
      toast.error("Failed to add shipping option");
    } finally {
      setCreating(null);
    }
  }

  async function createCoupon() {
    if (!couponForm.code.trim()) { toast.error("Coupon code is required"); return; }
    setCreating("coupon");
    try {
      const payload: Record<string, unknown> = {
        code: couponForm.code.toUpperCase().trim(),
        type: couponForm.type,
        value: Number(couponForm.value) || 0,
        active: !!couponForm.active,
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("create failed");
      toast.success("Coupon added");
      setCouponOpen(false);
      setCouponForm(emptyCoupon);
      await loadData();
    } catch {
      toast.error("Failed to add coupon");
    } finally {
      setCreating(null);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold">{ar ? "الإعدادات" : "Settings"}</h1>
      </motion.div>
      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card><CardHeader><CardTitle>Site Settings</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><Label>Logo Text</Label><Input value={settings.logoText || ""} onChange={(e) => setSettings({...settings, logoText: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={settings.phone || ""} onChange={(e) => setSettings({...settings, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={settings.email || ""} onChange={(e) => setSettings({...settings, email: e.target.value})} /></div>
            <div><Label>Address</Label><Input value={settings.address || ""} onChange={(e) => setSettings({...settings, address: e.target.value})} /></div>
            <div><Label>Announcement 1</Label><Input value={settings.announcement1 || ""} onChange={(e) => setSettings({...settings, announcement1: e.target.value})} /></div>
            <div><Label>Announcement 2</Label><Input value={settings.announcement2 || ""} onChange={(e) => setSettings({...settings, announcement2: e.target.value})} /></div>
            <div><Label>Free Ship Threshold ($)</Label><Input value={settings.freeShipThreshold || "70"} onChange={(e) => setSettings({...settings, freeShipThreshold: e.target.value})} /></div>
            <div><Label>Instagram Handle</Label><Input value={settings.instagramHandle || ""} onChange={(e) => setSettings({...settings, instagramHandle: e.target.value})} /></div>
            <div>
              <Label>Instagram Images (JSON array of URLs)</Label>
              <Input
                value={settings.instagramImages || ""}
                onChange={(e) => setSettings({...settings, instagramImages: e.target.value})}
                placeholder='["https://images.unsplash.com/...", "https://..."]'
              />
              <p className="mt-1 text-xs text-muted-foreground">A JSON array of image URLs used in the home page Instagram feed.</p>
            </div>
            <Button onClick={saveSettings} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
          </CardContent></Card>
        </TabsContent>

        {/* HERO */}
        <TabsContent value="hero">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Hero Slides ({heroSlides.length})</CardTitle>
              <Button onClick={() => { setHeroForm(emptyHero); setHeroOpen(true); }} className="gap-2" size="sm">
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {heroSlides.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No hero slides yet.</p>
              ) : heroSlides.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {s.image && <img src={s.image} alt="" className="size-12 rounded object-cover" />}
                  <div className="flex-1"><p className="text-sm font-medium">{s.title}</p><p className="text-xs text-muted-foreground">Order: {s.order} · {s.active ? "Active" : "Inactive"}</p></div>
                  <Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => deleteItem("/api/admin/hero", s.id)}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TESTIMONIALS */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Testimonials ({testimonials.length})</CardTitle>
              <Button onClick={() => { setTestimonialForm(emptyTestimonial); setTestimonialOpen(true); }} className="gap-2" size="sm">
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {testimonials.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No testimonials yet.</p>
              ) : testimonials.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {t.avatar && <img src={t.avatar} alt="" className="size-10 rounded-full object-cover" />}
                  <div className="flex-1"><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground truncate">{t.text}</p></div>
                  <Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => deleteItem("/api/admin/testimonials", t.id)}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SHIPPING */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Shipping Options ({shippingOpts.length})</CardTitle>
              <Button onClick={() => { setShippingForm(emptyShipping); setShippingOpen(true); }} className="gap-2" size="sm">
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {shippingOpts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No shipping options yet.</p>
              ) : shippingOpts.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1"><p className="text-sm font-medium">{s.label}</p><p className="text-xs text-muted-foreground">${s.price} · {s.active ? "Active" : "Inactive"}</p></div>
                  <Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => deleteItem("/api/admin/shipping", s.id)}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COUPONS */}
        <TabsContent value="coupons">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Coupons ({coupons.length})</CardTitle>
              <Button onClick={() => { setCouponForm(emptyCoupon); setCouponOpen(true); }} className="gap-2" size="sm">
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {coupons.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No coupons yet.</p>
              ) : coupons.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1"><p className="text-sm font-medium font-mono">{c.code}</p><p className="text-xs text-muted-foreground">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`} · {c.active ? "Active" : "Inactive"}{c.expiresAt ? ` · exp ${new Date(c.expiresAt).toLocaleDateString()}` : ""}</p></div>
                  <Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => deleteItem("/api/admin/coupons", c.id)}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* HERO DIALOG */}
      <Dialog open={heroOpen} onOpenChange={setHeroOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Hero Slide</DialogTitle>
            <DialogDescription>Create a new home-page hero slide.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div><Label>Image URL *</Label><Input value={heroForm.image} onChange={(e) => setHeroForm({...heroForm, image: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Eyebrow (EN)</Label><Input value={heroForm.eyebrow} onChange={(e) => setHeroForm({...heroForm, eyebrow: e.target.value})} /></div>
              <div><Label>Eyebrow (AR)</Label><Input value={heroForm.eyebrowAr} onChange={(e) => setHeroForm({...heroForm, eyebrowAr: e.target.value})} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title (EN) *</Label><Input value={heroForm.title} onChange={(e) => setHeroForm({...heroForm, title: e.target.value})} /></div>
              <div><Label>Title (AR)</Label><Input value={heroForm.titleAr} onChange={(e) => setHeroForm({...heroForm, titleAr: e.target.value})} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Subtitle (EN)</Label><Input value={heroForm.subtitle} onChange={(e) => setHeroForm({...heroForm, subtitle: e.target.value})} /></div>
              <div><Label>Subtitle (AR)</Label><Input value={heroForm.subtitleAr} onChange={(e) => setHeroForm({...heroForm, subtitleAr: e.target.value})} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CTA (EN)</Label><Input value={heroForm.cta} onChange={(e) => setHeroForm({...heroForm, cta: e.target.value})} /></div>
              <div><Label>CTA (AR)</Label><Input value={heroForm.ctaAr} onChange={(e) => setHeroForm({...heroForm, ctaAr: e.target.value})} dir="rtl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Link href</Label><Input value={heroForm.href} onChange={(e) => setHeroForm({...heroForm, href: e.target.value})} placeholder="/shop" /></div>
              <div><Label>Order</Label><Input type="number" value={heroForm.order} onChange={(e) => setHeroForm({...heroForm, order: Number(e.target.value)})} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="hero-active" className="text-sm">Active</Label>
              <Switch id="hero-active" checked={heroForm.active} onCheckedChange={(v) => setHeroForm({...heroForm, active: v})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHeroOpen(false)} disabled={creating === "hero"}>Cancel</Button>
            <Button onClick={createHero} disabled={creating === "hero"}>
              {creating === "hero" ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : "Create Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TESTIMONIAL DIALOG */}
      <Dialog open={testimonialOpen} onOpenChange={setTestimonialOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Testimonial</DialogTitle>
            <DialogDescription>Add a new customer testimonial.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div><Label>Text *</Label><Input value={testimonialForm.text} onChange={(e) => setTestimonialForm({...testimonialForm, text: e.target.value})} placeholder="Loved this coat..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={testimonialForm.name} onChange={(e) => setTestimonialForm({...testimonialForm, name: e.target.value})} /></div>
              <div><Label>Role</Label><Input value={testimonialForm.role} onChange={(e) => setTestimonialForm({...testimonialForm, role: e.target.value})} placeholder="Verified Buyer" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Product</Label><Input value={testimonialForm.product} onChange={(e) => setTestimonialForm({...testimonialForm, product: e.target.value})} /></div>
              <div><Label>Price (display)</Label><Input value={testimonialForm.price} onChange={(e) => setTestimonialForm({...testimonialForm, price: e.target.value})} placeholder="$129.00" /></div>
            </div>
            <div><Label>Avatar URL</Label><Input value={testimonialForm.avatar} onChange={(e) => setTestimonialForm({...testimonialForm, avatar: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Order</Label><Input type="number" value={testimonialForm.order} onChange={(e) => setTestimonialForm({...testimonialForm, order: Number(e.target.value)})} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="t-active" className="text-sm">Active</Label>
                <Switch id="t-active" checked={testimonialForm.active} onCheckedChange={(v) => setTestimonialForm({...testimonialForm, active: v})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialOpen(false)} disabled={creating === "testimonial"}>Cancel</Button>
            <Button onClick={createTestimonial} disabled={creating === "testimonial"}>
              {creating === "testimonial" ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : "Create Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SHIPPING DIALOG */}
      <Dialog open={shippingOpen} onOpenChange={setShippingOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shipping Option</DialogTitle>
            <DialogDescription>Add a new shipping method.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div><Label>Label (EN) *</Label><Input value={shippingForm.label} onChange={(e) => setShippingForm({...shippingForm, label: e.target.value})} placeholder="Flat Rate" /></div>
            <div><Label>Label (AR)</Label><Input value={shippingForm.labelAr} onChange={(e) => setShippingForm({...shippingForm, labelAr: e.target.value})} dir="rtl" placeholder="سعر ثابت" /></div>
            <div><Label>Price ($)</Label><Input type="number" step="0.01" value={shippingForm.price} onChange={(e) => setShippingForm({...shippingForm, price: Number(e.target.value)})} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="s-active" className="text-sm">Active</Label>
              <Switch id="s-active" checked={shippingForm.active} onCheckedChange={(v) => setShippingForm({...shippingForm, active: v})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOpen(false)} disabled={creating === "shipping"}>Cancel</Button>
            <Button onClick={createShipping} disabled={creating === "shipping"}>
              {creating === "shipping" ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : "Create Option"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COUPON DIALOG */}
      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Coupon</DialogTitle>
            <DialogDescription>Create a new discount coupon.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div><Label>Code *</Label><Input value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="SUMMER10" className="font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={couponForm.type} onValueChange={(v) => setCouponForm({...couponForm, type: v as "percentage" | "fixed"})}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value</Label><Input type="number" step="0.01" value={couponForm.value} onChange={(e) => setCouponForm({...couponForm, value: Number(e.target.value)})} /></div>
            </div>
            <div><Label>Expires At (optional)</Label><Input type="date" value={couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString().slice(0, 10) : ""} onChange={(e) => setCouponForm({...couponForm, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null})} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="c-active" className="text-sm">Active</Label>
              <Switch id="c-active" checked={couponForm.active} onCheckedChange={(v) => setCouponForm({...couponForm, active: v})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCouponOpen(false)} disabled={creating === "coupon"}>Cancel</Button>
            <Button onClick={createCoupon} disabled={creating === "coupon"}>
              {creating === "coupon" ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
