"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CircleDollarSign,
  Instagram,
  Images,
  LayoutTemplate,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings2,
  ShieldAlert,
  Store,
  TicketPercent,
  Trash2,
  Truck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  DEFAULT_HOME_CONFIG,
  HOME_SECTION_KEYS,
  HOME_SECTION_LABELS,
  parseHomeConfig,
  type HomeConfig,
  type HomeContentKey,
  type HomeImageKey,
} from "@/lib/home-config";

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
interface CatalogCategory { id: number; name: string; nameAr: string; image: string; active: boolean; }

const HOME_CONTENT_GROUPS: { title: string; fields: { key: HomeContentKey; label: string; multiline?: boolean }[] }[] = [
  { title: "Section headings", fields: [
    { key: "exploreTitle", label: "Collections title" }, { key: "collectionsCta", label: "Collections link" },
    { key: "newArrivalsTitle", label: "New arrivals title" }, { key: "newArrivalsDescription", label: "New arrivals description" },
    { key: "bestSellersTitle", label: "Best sellers title" }, { key: "bestSellersDescription", label: "Best sellers description" },
  ] },
  { title: "Collection banners", fields: [
    { key: "collectionLeftTitle", label: "Left title" }, { key: "collectionRightTitle", label: "Right title" },
    { key: "collectionDiscount", label: "Discount text" }, { key: "collectionCta", label: "Button text" },
  ] },
  { title: "Promotion", fields: [
    { key: "promoTitle1", label: "Title — line 1" }, { key: "promoTitle2", label: "Title — line 2" },
    { key: "promoSubtitle", label: "Subtitle" }, { key: "promoCta", label: "Button text" },
  ] },
  { title: "Store features", fields: [
    { key: "feature1Title", label: "Feature 1 title" }, { key: "feature1Description", label: "Feature 1 description" },
    { key: "feature2Title", label: "Feature 2 title" }, { key: "feature2Description", label: "Feature 2 description" },
    { key: "feature3Title", label: "Feature 3 title" }, { key: "feature3Description", label: "Feature 3 description" },
    { key: "feature4Title", label: "Feature 4 title" }, { key: "feature4Description", label: "Feature 4 description" },
  ] },
  { title: "Brand story", fields: [
    { key: "brandEyebrow", label: "Eyebrow" }, { key: "brandTitle", label: "Title" },
    { key: "brandBody", label: "Story", multiline: true }, { key: "brandStatLabel", label: "Statistic label" },
    { key: "brandFeature1Title", label: "Point 1 title" }, { key: "brandFeature1Description", label: "Point 1 description" },
    { key: "brandFeature2Title", label: "Point 2 title" }, { key: "brandFeature2Description", label: "Point 2 description" },
    { key: "brandFeature3Title", label: "Point 3 title" }, { key: "brandFeature3Description", label: "Point 3 description" },
    { key: "brandCta", label: "Button text" },
  ] },
  { title: "Testimonials & Instagram", fields: [
    { key: "testimonialsTitle", label: "Testimonials title" }, { key: "testimonialsSubtitle", label: "Testimonials subtitle" },
    { key: "instagramTitle", label: "Instagram title" }, { key: "instagramSubtitle", label: "Instagram subtitle" },
  ] },
];

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

function SettingsPanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e6ece8] bg-white shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
      <div className="flex items-start gap-3 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fff0f1] text-[#FF2D36]">
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="text-[13px] font-semibold text-[#1b241f]">{title}</h2>
          <p className="mt-0.5 text-[10px] leading-4 text-[#87918c]">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[10px] font-semibold text-[#56615b]">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[9px] leading-4 text-[#919b96]">{hint}</p>}
    </div>
  );
}

function SelectionPanel({
  title, description, items, selected, onToggle, onClear, manageHref,
}: {
  title: string;
  description: string;
  items: { id: number; label: string; detail?: string; image?: string }[];
  selected: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
  manageHref?: string;
}) {
  return (
    <SettingsPanel icon={LayoutTemplate} title={title} description={description}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] text-[#87918c]">{selected.length ? `${selected.length} selected · selection order is display order` : "Automatic selection is active"}</p>
        <div className="flex gap-2">
          {selected.length > 0 && <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" onClick={onClear}>Use automatic</Button>}
          {manageHref && <Button asChild type="button" variant="outline" size="sm" className="h-7 text-[10px]"><Link href={manageHref}>Manage items</Link></Button>}
        </div>
      </div>
      {items.length === 0 ? <p className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground">No items available.</p> : (
        <div className="grid max-h-72 gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
          {items.map((item) => {
            const index = selected.indexOf(item.id);
            return (
              <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e4eae6] p-2.5 hover:bg-[#fafcfb]">
                <Checkbox checked={index >= 0} onCheckedChange={() => onToggle(item.id)} />
                {item.image && <img src={item.image} alt="" className="size-10 shrink-0 rounded-md object-cover" />}
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{item.label}</span>{item.detail && <span className="block truncate text-[10px] text-muted-foreground">{item.detail}</span>}</span>
                {index >= 0 && <span className="grid size-5 place-items-center rounded-full bg-[#fff0f1] text-[9px] font-bold text-[#FF2D36]">{index + 1}</span>}
              </label>
            );
          })}
        </div>
      )}
    </SettingsPanel>
  );
}

const settingsInputClass = "h-10 rounded-lg border-[#dfe8e2] bg-white text-xs text-[#26312b] shadow-none placeholder:text-[#a6afaa] focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20";
const tabTriggerClass = "h-9 shrink-0 rounded-lg px-3.5 text-[11px] font-semibold text-[#69746e] data-[state=active]:bg-[#fff0f1] data-[state=active]:text-[#FF2D36] data-[state=active]:shadow-none";
const dangerInputClass = "h-10 rounded-lg border-[#f0b8bc] bg-white text-xs text-[#26312b] shadow-none placeholder:text-[#c99a9c] focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626]/20";

type DangerOp = "delete_products" | "delete_categories" | "reset_store";
const DANGER_CONFIRM_PHRASES: Record<DangerOp, string> = {
  delete_products: "DELETE ALL PRODUCTS",
  delete_categories: "DELETE ALL CATEGORIES",
  reset_store: "RESET STORE",
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
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG);

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
  const [activeTab, setActiveTab] = useState("general");

  // Hero slide editing
  const [editingHeroId, setEditingHeroId] = useState<number | null>(null);
  const [savingHero, setSavingHero] = useState(false);
  const savingHeroRef = useRef(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  // ---------- Danger Zone state ----------
  const [dbStats, setDbStats] = useState<{ products: number; categories: number } | null>(null);
  const [dangerOp, setDangerOp] = useState<DangerOp | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState("");
  const [dangerPassword, setDangerPassword] = useState("");
  const [dangerLoading, setDangerLoading] = useState<DangerOp | null>(null);
  const dangerRequestInFlight = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h, t, sh, c, db, categoriesData] = await Promise.all([
        fetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/hero", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/testimonials", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/shipping", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/coupons", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/database", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/categories", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setSettings(s.settings || {});
      setHomeConfig(parseHomeConfig(s.settings?.homeConfig));
      setHeroSlides(h.slides || []);
      setTestimonials(t.testimonials || []);
      setShippingOpts(sh.options || []);
      setCoupons(c.coupons || []);
      setCatalogCategories(categoriesData.categories || []);
      setDbStats({ products: db.products ?? 0, categories: db.categories ?? 0 });
    } catch {
      // ignore — keep empty lists
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function openDangerDialog(op: DangerOp) {
    setDangerConfirmText("");
    setDangerPassword("");
    setDangerOp(op);
  }

  function closeDangerDialog() {
    if (dangerLoading) return; // don't allow dismissing mid-request
    setDangerOp(null);
    setDangerConfirmText("");
    setDangerPassword("");
  }

  async function runDangerOperation(op: DangerOp) {
    if (dangerRequestInFlight.current) return;
    dangerRequestInFlight.current = true;
    setDangerLoading(op);
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: op,
          confirmation: dangerConfirmText,
          ...(op === "reset_store" ? { password: dangerPassword } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || (ar ? "فشلت العملية" : "Operation failed"));
        return;
      }
      toast.success(
        op === "delete_products"
          ? ar ? "تم حذف كل المنتجات" : "All products deleted"
          : op === "delete_categories"
          ? ar ? "تم حذف كل الفئات" : "All categories deleted"
          : ar ? "تمت إعادة تعيين قاعدة بيانات المتجر" : "Store database has been reset"
      );
      setDangerOp(null);
      setDangerConfirmText("");
      setDangerPassword("");
      await loadData();
    } catch {
      toast.error(ar ? "فشلت العملية" : "Operation failed");
    } finally {
      dangerRequestInFlight.current = false;
      setDangerLoading(null);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, homeConfig: JSON.stringify(homeConfig) }),
      });
      if (!response.ok) throw new Error("save failed");
      setSettings((current) => ({ ...current, homeConfig: JSON.stringify(homeConfig) }));
      toast.success(ar ? "تم حفظ الإعدادات" : "Settings saved");
    } catch { toast.error(ar ? "تعذر حفظ الإعدادات" : "Failed to save settings"); }
    finally { setSaving(false); }
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
    if (!heroForm.image.trim()) { toast.error("An image is required"); return; }
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

  function openCreateHero() {
    setEditingHeroId(null);
    setHeroForm(emptyHero);
    setHeroOpen(true);
  }

  function openEditHero(slide: HeroSlide) {
    setEditingHeroId(slide.id);
    setHeroForm({
      image: slide.image,
      eyebrow: slide.eyebrow,
      eyebrowAr: slide.eyebrowAr,
      title: slide.title,
      titleAr: slide.titleAr,
      subtitle: slide.subtitle,
      subtitleAr: slide.subtitleAr,
      cta: slide.cta,
      ctaAr: slide.ctaAr,
      href: slide.href,
      order: slide.order,
      active: slide.active,
    });
    setHeroOpen(true);
  }

  async function saveHero() {
    if (!heroForm.title.trim()) { toast.error("Title is required"); return; }
    if (!heroForm.image.trim()) { toast.error("An image is required"); return; }
    if (editingHeroId == null) return createHero();

    // Prevent duplicate update requests while saving.
    if (savingHeroRef.current) return;
    savingHeroRef.current = true;
    setSavingHero(true);
    try {
      const res = await fetch(`/api/admin/hero/${editingHeroId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: heroForm.image,
          eyebrow: heroForm.eyebrow,
          eyebrowAr: heroForm.eyebrowAr,
          title: heroForm.title,
          titleAr: heroForm.titleAr,
          subtitle: heroForm.subtitle,
          subtitleAr: heroForm.subtitleAr,
          cta: heroForm.cta,
          ctaAr: heroForm.ctaAr,
          href: heroForm.href,
          order: Number(heroForm.order) || 0,
          active: !!heroForm.active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "update failed");
      toast.success("Hero slide updated");
      setHeroOpen(false);
      setEditingHeroId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update hero slide");
    } finally {
      savingHeroRef.current = false;
      setSavingHero(false);
    }
  }

  function openCreateTestimonial() {
    setEditingTestimonialId(null);
    setTestimonialForm(emptyTestimonial);
    setTestimonialOpen(true);
  }

  function openEditTestimonial(item: Testimonial) {
    setEditingTestimonialId(item.id);
    setTestimonialForm({
      text: item.text, name: item.name, role: item.role, product: item.product,
      price: item.price, avatar: item.avatar, order: item.order, active: item.active,
    });
    setTestimonialOpen(true);
  }

  async function saveTestimonial() {
    if (!testimonialForm.name.trim()) { toast.error("Name is required"); return; }
    if (!testimonialForm.text.trim()) { toast.error("Text is required"); return; }
    if (savingTestimonial) return;
    setSavingTestimonial(true);
    try {
      const res = await fetch(editingTestimonialId == null ? "/api/admin/testimonials" : `/api/admin/testimonials/${editingTestimonialId}`, {
        method: editingTestimonialId == null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...testimonialForm,
          order: Number(testimonialForm.order) || 0,
          active: !!testimonialForm.active,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      toast.success(editingTestimonialId == null ? "Testimonial added" : "Testimonial updated");
      setTestimonialOpen(false);
      setEditingTestimonialId(null);
      setTestimonialForm(emptyTestimonial);
      await loadData();
    } catch {
      toast.error(editingTestimonialId == null ? "Failed to add testimonial" : "Failed to update testimonial");
    } finally {
      setSavingTestimonial(false);
    }
  }

  function toggleHomeSelection(key: "collections" | "testimonials", id: number) {
    const selected = homeConfig[key];
    if (selected.includes(id)) {
      setHomeConfig((current) => ({ ...current, [key]: current[key].filter((item) => item !== id) }));
      return;
    }
    const limit = key === "collections" ? 5 : 12;
    if (selected.length >= limit) {
      toast.error(`You can select up to ${limit} items for this section.`);
      return;
    }
    setHomeConfig((current) => ({ ...current, [key]: [...current[key], id] }));
  }

  function updateHomeText(key: HomeContentKey, language: "en" | "ar", value: string) {
    setHomeConfig((current) => ({
      ...current,
      content: { ...current.content, [key]: { ...current.content[key], [language]: value } },
    }));
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

  if (loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="size-5 animate-spin text-[#FF2D36]" /></div>;

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e6ece8] bg-white px-4 py-4 shadow-[0_5px_18px_rgba(27,61,46,0.03)] sm:px-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f1] text-[#FF2D36]"><Settings2 className="size-5" /></span>
        <h1 className="font-display text-3xl font-semibold">{ar ? "الإعدادات" : "Settings"}</h1>
        <Button onClick={saveSettings} disabled={saving} className="h-9 rounded-lg bg-[#FF2D36] px-3.5 text-[11px] font-semibold text-white hover:bg-[#e52630]">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving changes" : "Save changes"}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="no-scrollbar flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-[#e6ece8] bg-white p-2 shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
          <TabsTrigger value="general" className={tabTriggerClass}><Store className="size-3.5" />General</TabsTrigger>
          <TabsTrigger value="homepage" className={tabTriggerClass}><Images className="size-3.5" />Homepage</TabsTrigger>
          <TabsTrigger value="hero" className={tabTriggerClass}><LayoutTemplate className="size-3.5" />Hero slides</TabsTrigger>
          <TabsTrigger value="testimonials" className={tabTriggerClass}><UsersRound className="size-3.5" />Testimonials</TabsTrigger>
          <TabsTrigger value="shipping" className={tabTriggerClass}><Truck className="size-3.5" />Shipping</TabsTrigger>
          <TabsTrigger value="coupons" className={tabTriggerClass}><TicketPercent className="size-3.5" />Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-0 space-y-4 focus-visible:outline-none">
          <SettingsPanel icon={Store} title="Store identity" description="The details customers see across your storefront and order communications.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Store name"><Input className={settingsInputClass} value={settings.logoText || ""} onChange={(e) => setSettings({ ...settings, logoText: e.target.value })} placeholder="Modave" /></SettingsField>
              <SettingsField label="Support email"><Input className={settingsInputClass} type="email" value={settings.email || ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="hello@yourstore.com" /></SettingsField>
              <SettingsField label="Phone number"><Input className={settingsInputClass} value={settings.phone || ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+1 555 000 0000" /></SettingsField>
              <SettingsField label="Store address"><Input className={settingsInputClass} value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} placeholder="Street, city, country" /></SettingsField>
            </div>
          </SettingsPanel>
          <SettingsPanel icon={BellRing} title="Announcement bar" description="Short messages shown above your storefront navigation.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Primary announcement"><Input className={settingsInputClass} value={settings.announcement1 || ""} onChange={(e) => setSettings({ ...settings, announcement1: e.target.value })} placeholder="Free shipping on orders over $70" /></SettingsField>
              <SettingsField label="Secondary announcement"><Input className={settingsInputClass} value={settings.announcement2 || ""} onChange={(e) => setSettings({ ...settings, announcement2: e.target.value })} placeholder="Easy returns within 14 days" /></SettingsField>
              <SettingsField label="Primary announcement (AR)"><Input dir="rtl" className={settingsInputClass} value={settings.announcement1Ar || ""} onChange={(e) => setSettings({ ...settings, announcement1Ar: e.target.value })} /></SettingsField>
              <SettingsField label="Secondary announcement (AR)"><Input dir="rtl" className={settingsInputClass} value={settings.announcement2Ar || ""} onChange={(e) => setSettings({ ...settings, announcement2Ar: e.target.value })} /></SettingsField>
            </div>
          </SettingsPanel>
          <SettingsPanel icon={CircleDollarSign} title="Checkout rules" description="Control free shipping, cart urgency, and automatic discounts.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SettingsField label="Free shipping threshold" hint="Cart subtotal in USD."><Input className={settingsInputClass} type="number" min="0" value={settings.freeShipThreshold || "70"} onChange={(e) => setSettings({ ...settings, freeShipThreshold: e.target.value })} /></SettingsField>
              <SettingsField label="Cart countdown (minutes)"><Input className={settingsInputClass} type="number" min="1" value={settings.cartCountdownMinutes || "15"} onChange={(e) => setSettings({ ...settings, cartCountdownMinutes: e.target.value })} /></SettingsField>
              <SettingsField label="Discount threshold"><Input className={settingsInputClass} type="number" min="0" value={settings.discountThreshold || "200"} onChange={(e) => setSettings({ ...settings, discountThreshold: e.target.value })} /></SettingsField>
              <SettingsField label="Discount percentage"><Input className={settingsInputClass} type="number" min="0" max="100" value={settings.discountPercentage || "10"} onChange={(e) => setSettings({ ...settings, discountPercentage: e.target.value })} /></SettingsField>
              <SettingsField label="Maximum discount"><Input className={settingsInputClass} type="number" min="0" value={settings.maxDiscount || "80"} onChange={(e) => setSettings({ ...settings, maxDiscount: e.target.value })} /></SettingsField>
              <SettingsField label="Sale countdown (hours)"><Input className={settingsInputClass} type="number" min="1" value={settings.countdownHours || "48"} onChange={(e) => setSettings({ ...settings, countdownHours: e.target.value })} /></SettingsField>
            </div>
          </SettingsPanel>
          <SettingsPanel icon={Instagram} title="Instagram feed" description="Connect the social content shown in the homepage feed.">
            <div className="grid gap-4">
              <SettingsField label="Instagram handle"><Input className={settingsInputClass} value={settings.instagramHandle || ""} onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })} placeholder="@yourstore" /></SettingsField>
              <SettingsField label="Instagram image URLs" hint="Use a JSON array of image URLs. The feed updates after saving."><Input className={settingsInputClass} value={settings.instagramImages || ""} onChange={(e) => setSettings({ ...settings, instagramImages: e.target.value })} placeholder='["https://images.unsplash.com/...", "https://..."]' /></SettingsField>
            </div>
          </SettingsPanel>
          <div className="flex items-center justify-between rounded-xl border border-[#ffd8da] bg-[#fff7f7] px-4 py-3 sm:px-5"><p className="text-[10px] text-[#96656a]">Changes are applied to your storefront after saving.</p><Button onClick={saveSettings} disabled={saving} variant="ghost" className="h-8 rounded-lg px-2 text-[10px] font-semibold text-[#FF2D36] hover:bg-[#fff0f1]">Save changes</Button></div>
        </TabsContent>

        {/* HOMEPAGE CONTENT */}
        <TabsContent value="homepage" className="mt-0 space-y-4 focus-visible:outline-none">
          <SettingsPanel icon={LayoutTemplate} title="Homepage sections" description="Show or hide any homepage block without deleting its content.">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {HOME_SECTION_KEYS.map((key) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-[#e4eae6] px-3 py-2.5">
                  <Label htmlFor={`section-${key}`} className="text-[11px] font-medium">{ar ? HOME_SECTION_LABELS[key].ar : HOME_SECTION_LABELS[key].en}</Label>
                  <Switch id={`section-${key}`} checked={homeConfig.sections[key]} onCheckedChange={(checked) => setHomeConfig((current) => ({ ...current, sections: { ...current.sections, [key]: checked } }))} />
                </div>
              ))}
            </div>
          </SettingsPanel>

          {HOME_CONTENT_GROUPS.map((group) => (
            <SettingsPanel key={group.title} icon={Pencil} title={group.title} description="Edit the English and Arabic copy shown on the storefront.">
              <div className="grid gap-4 lg:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.key} className={field.multiline ? "lg:col-span-2" : ""}>
                    <Label className="text-[10px] font-semibold text-[#56615b]">{field.label}</Label>
                    <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                      {field.multiline ? (
                        <>
                          <Textarea className="min-h-24 text-xs" value={homeConfig.content[field.key].en} onChange={(e) => updateHomeText(field.key, "en", e.target.value)} placeholder="English" />
                          <Textarea dir="rtl" className="min-h-24 text-xs" value={homeConfig.content[field.key].ar} onChange={(e) => updateHomeText(field.key, "ar", e.target.value)} placeholder="العربية" />
                        </>
                      ) : (
                        <>
                          <Input className={settingsInputClass} value={homeConfig.content[field.key].en} onChange={(e) => updateHomeText(field.key, "en", e.target.value)} placeholder="English" />
                          <Input dir="rtl" className={settingsInputClass} value={homeConfig.content[field.key].ar} onChange={(e) => updateHomeText(field.key, "ar", e.target.value)} placeholder="العربية" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SettingsPanel>
          ))}

          <SettingsPanel icon={Images} title="Homepage images" description="Upload or paste a URL for every editorial image on the homepage.">
            <div className="grid gap-5 lg:grid-cols-2">
              {([
                ["collectionLeft", "Collection banner — left"], ["collectionCenter", "Collection banner — center"],
                ["collectionRight", "Collection banner — right"], ["promoLeft", "Promotion — left"],
                ["promoRight", "Promotion — right"], ["brandStory", "Brand story"],
              ] as [HomeImageKey, string][]).map(([key, label]) => (
                <ImageUpload key={key} label={label} value={homeConfig.images[key]} onChange={(value) => setHomeConfig((current) => ({ ...current, images: { ...current.images, [key]: value } }))} />
              ))}
            </div>
          </SettingsPanel>

          <SettingsPanel icon={LayoutTemplate} title="Links & statistic" description="Destinations for homepage buttons and the brand-story statistic.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Collections link"><Input className={settingsInputClass} value={homeConfig.links.collections} onChange={(e) => setHomeConfig((current) => ({ ...current, links: { ...current.links, collections: e.target.value } }))} /></SettingsField>
              <SettingsField label="Collection banners link"><Input className={settingsInputClass} value={homeConfig.links.collectionBanner} onChange={(e) => setHomeConfig((current) => ({ ...current, links: { ...current.links, collectionBanner: e.target.value } }))} /></SettingsField>
              <SettingsField label="Promotion link"><Input className={settingsInputClass} value={homeConfig.links.promo} onChange={(e) => setHomeConfig((current) => ({ ...current, links: { ...current.links, promo: e.target.value } }))} /></SettingsField>
              <SettingsField label="Brand statistic"><Input className={settingsInputClass} value={homeConfig.brandStat} onChange={(e) => setHomeConfig((current) => ({ ...current, brandStat: e.target.value }))} placeholder="12+" /></SettingsField>
            </div>
          </SettingsPanel>

          <SelectionPanel title="Homepage collections" description="Choose up to five collections and control their display order." items={catalogCategories.filter((item) => item.active).map((item) => ({ id: item.id, label: ar ? item.nameAr : item.name, detail: "Active", image: item.image }))} selected={homeConfig.collections} onToggle={(id) => toggleHomeSelection("collections", id)} onClear={() => setHomeConfig((current) => ({ ...current, collections: [] }))} manageHref="/admin/categories" />
          <SelectionPanel title="Homepage testimonials" description="Choose and order the customer testimonials shown on the homepage." items={testimonials.filter((item) => item.active).map((item) => ({ id: item.id, label: item.name, detail: item.text, image: item.avatar }))} selected={homeConfig.testimonials} onToggle={(id) => toggleHomeSelection("testimonials", id)} onClear={() => setHomeConfig((current) => ({ ...current, testimonials: [] }))} />

          <div className="sticky bottom-3 flex items-center justify-between rounded-xl border border-[#ffd8da] bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:px-5">
            <p className="text-[10px] text-[#96656a]">Save changes to publish the homepage content.</p>
            <Button onClick={saveSettings} disabled={saving} className="h-8 rounded-lg bg-[#FF2D36] px-3 text-[10px] font-semibold text-white hover:bg-[#e52630]">{saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save homepage</Button>
          </div>
        </TabsContent>

        {/* HERO */}
        <TabsContent value="hero" className="mt-0 focus-visible:outline-none">
          <Card className="overflow-hidden rounded-xl border-[#e6ece8] shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
              <div><CardTitle className="text-[13px] font-semibold text-[#1b241f]">Hero slides</CardTitle><p className="mt-1 text-[10px] text-[#87918c]">{heroSlides.length} configured slides for the storefront.</p></div>
              <Button onClick={openCreateHero} className="h-8 rounded-lg bg-[#FF2D36] px-3 text-[10px] font-semibold hover:bg-[#e52630]" size="sm">
                <Plus className="size-3.5" /> Add slide
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-5">
              {heroSlides.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No hero slides yet.</p>
              ) : heroSlides.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {s.image && <img src={s.image} alt="" className="size-12 rounded object-cover" />}
                  <div className="flex-1"><p className="text-sm font-medium">{s.title}</p><p className="text-xs text-muted-foreground">Order: {s.order} · {s.active ? "Active" : "Inactive"}</p></div>
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => openEditHero(s)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => deleteItem("/api/admin/hero", s.id)}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TESTIMONIALS */}
        <TabsContent value="testimonials" className="mt-0 focus-visible:outline-none">
          <Card className="overflow-hidden rounded-xl border-[#e6ece8] shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
              <div><CardTitle className="text-[13px] font-semibold text-[#1b241f]">Testimonials</CardTitle><p className="mt-1 text-[10px] text-[#87918c]">{testimonials.length} customer stories shown on the storefront.</p></div>
              <Button onClick={openCreateTestimonial} className="h-8 rounded-lg bg-[#FF2D36] px-3 text-[10px] font-semibold hover:bg-[#e52630]" size="sm">
                <Plus className="size-3.5" /> Add testimonial
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-5">
              {testimonials.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No testimonials yet.</p>
              ) : testimonials.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {t.avatar && <img src={t.avatar} alt="" className="size-10 rounded-full object-cover" />}
                  <div className="flex-1"><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground truncate">{t.text}</p></div>
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => openEditTestimonial(t)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => deleteItem("/api/admin/testimonials", t.id)}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SHIPPING */}
        <TabsContent value="shipping" className="mt-0 focus-visible:outline-none">
          <Card className="overflow-hidden rounded-xl border-[#e6ece8] shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
              <div><CardTitle className="text-[13px] font-semibold text-[#1b241f]">Shipping methods</CardTitle><p className="mt-1 text-[10px] text-[#87918c]">{shippingOpts.length} delivery options available at checkout.</p></div>
              <Button onClick={() => { setShippingForm(emptyShipping); setShippingOpen(true); }} className="h-8 rounded-lg bg-[#FF2D36] px-3 text-[10px] font-semibold hover:bg-[#e52630]" size="sm">
                <Plus className="size-3.5" /> Add method
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-5">
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
        <TabsContent value="coupons" className="mt-0 focus-visible:outline-none">
          <Card className="overflow-hidden rounded-xl border-[#e6ece8] shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#edf1ee] px-4 py-4 sm:px-5">
              <div><CardTitle className="text-[13px] font-semibold text-[#1b241f]">Discount coupons</CardTitle><p className="mt-1 text-[10px] text-[#87918c]">{coupons.length} promotion codes created for your store.</p></div>
              <Button onClick={() => { setCouponForm(emptyCoupon); setCouponOpen(true); }} className="h-8 rounded-lg bg-[#FF2D36] px-3 text-[10px] font-semibold hover:bg-[#e52630]" size="sm">
                <Plus className="size-3.5" /> Add coupon
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-5">
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

      {activeTab === "general" && (
      /* DANGER ZONE — only shown with the General settings. */
      <section className="overflow-hidden rounded-xl border-2 border-[#f3b9bd] bg-[#fff7f7] shadow-[0_5px_18px_rgba(220,38,38,0.06)]">
        <div className="flex items-start gap-3 border-b border-[#f3b9bd] px-4 py-4 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fde2e2] text-[#dc2626]">
            <ShieldAlert className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[13px] font-semibold text-[#7f1d1d]">{ar ? "منطقة الخطر" : "Danger Zone"}</h2>
            <p className="mt-0.5 text-[10px] leading-4 text-[#a55a5e]">
              {ar
                ? "عمليات حذف جماعية دائمة على قاعدة البيانات. هذه الإجراءات لا يمكن التراجع عنها."
                : "Permanent, bulk database operations. These actions cannot be undone."}
            </p>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-3">
          {/* Delete all products */}
          <div className="flex flex-col rounded-lg border border-[#f3b9bd] bg-white p-4">
            <p className="text-[12px] font-semibold text-[#1b241f]">{ar ? "حذف كل المنتجات" : "Delete All Products"}</p>
            <p className="mt-1.5 flex-1 text-[10px] leading-4 text-[#87918c]">
              {ar
                ? `سيتم حذف ${dbStats?.products ?? "—"} منتج نهائياً مع تقييماتها. لن تتأثر الطلبات أو العملاء أو الفئات.`
                : `Permanently deletes ${dbStats?.products ?? "—"} product${dbStats?.products === 1 ? "" : "s"} and their reviews. Orders, customers, and categories are not affected.`}
            </p>
            <Button
              onClick={() => openDangerDialog("delete_products")}
              variant="outline"
              size="sm"
              className="mt-3 h-8 w-full rounded-lg border-[#f3b9bd] bg-white px-3 text-[10px] font-semibold text-[#dc2626] hover:bg-[#fde2e2] hover:text-[#dc2626]"
            >
              <Trash2 className="size-3.5" /> {ar ? "حذف كل المنتجات" : "Delete All Products"}
            </Button>
          </div>

          {/* Delete all categories */}
          <div className="flex flex-col rounded-lg border border-[#f3b9bd] bg-white p-4">
            <p className="text-[12px] font-semibold text-[#1b241f]">{ar ? "حذف كل الفئات" : "Delete All Categories"}</p>
            <p className="mt-1.5 flex-1 text-[10px] leading-4 text-[#87918c]">
              {ar
                ? `سيتم حذف ${dbStats?.categories ?? "—"} فئة نهائياً. المنتجات تخزّن اسم الفئة بشكل مستقل وستبقى كما هي.`
                : `Permanently deletes ${dbStats?.categories ?? "—"} categor${dbStats?.categories === 1 ? "y" : "ies"}. Products store their category name independently and will remain untouched.`}
            </p>
            <Button
              onClick={() => openDangerDialog("delete_categories")}
              variant="outline"
              size="sm"
              className="mt-3 h-8 w-full rounded-lg border-[#f3b9bd] bg-white px-3 text-[10px] font-semibold text-[#dc2626] hover:bg-[#fde2e2] hover:text-[#dc2626]"
            >
              <Trash2 className="size-3.5" /> {ar ? "حذف كل الفئات" : "Delete All Categories"}
            </Button>
          </div>

          {/* Reset store database */}
          <div className="flex flex-col rounded-lg border-2 border-[#dc2626] bg-[#fde2e2]/50 p-4">
            <p className="text-[12px] font-semibold text-[#7f1d1d]">{ar ? "إعادة تعيين قاعدة بيانات المتجر" : "Reset Store Database"}</p>
            <p className="mt-1.5 flex-1 text-[10px] leading-4 text-[#a55a5e]">
              {ar
                ? "يحذف كل بيانات المتجر (المنتجات، الطلبات، العملاء، التقييمات، المدونة، الفئات، الإعدادات، الشرائح، الشهادات، خيارات الشحن، القسائم) نهائياً، مع الإبقاء على حساب المسؤول الحالي فقط."
                : "Permanently deletes ALL store data — products, orders, customers, reviews, blog posts, categories, settings, hero slides, testimonials, shipping options, and coupons — while keeping only your Admin account."}
            </p>
            <Button
              onClick={() => openDangerDialog("reset_store")}
              size="sm"
              className="mt-3 h-8 w-full rounded-lg bg-[#dc2626] px-3 text-[10px] font-semibold text-white hover:bg-[#b91c1c]"
            >
              <AlertTriangle className="size-3.5" /> {ar ? "إعادة تعيين المتجر" : "Reset Store Database"}
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* DANGER ZONE — Delete All Products confirmation */}
      <AlertDialog open={dangerOp === "delete_products"} onOpenChange={(o) => !o && closeDangerDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-[#7f1d1d]">
              {ar ? "حذف كل المنتجات؟" : "Delete all products?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  {ar
                    ? `سيتم حذف ${dbStats?.products ?? "—"} منتج نهائياً من قاعدة البيانات مع تقييماتها. لا يمكن التراجع عن هذا الإجراء. الطلبات والعملاء والفئات لن تتأثر.`
                    : `This will permanently delete ${dbStats?.products ?? "—"} product${dbStats?.products === 1 ? "" : "s"} and their reviews from the database. This action cannot be undone. Orders, customers, and categories will not be affected.`}
                </p>
                <p>
                  {ar ? (
                    <>اكتب <span className="font-mono font-semibold text-[#dc2626]">DELETE ALL PRODUCTS</span> للتأكيد:</>
                  ) : (
                    <>Type <span className="font-mono font-semibold text-[#dc2626]">DELETE ALL PRODUCTS</span> to confirm:</>
                  )}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            value={dangerConfirmText}
            onChange={(e) => setDangerConfirmText(e.target.value)}
            placeholder="DELETE ALL PRODUCTS"
            className={dangerInputClass}
            disabled={dangerLoading === "delete_products"}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangerLoading === "delete_products"}>
              {ar ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); runDangerOperation("delete_products"); }}
              disabled={dangerConfirmText !== DANGER_CONFIRM_PHRASES.delete_products || dangerLoading === "delete_products"}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {dangerLoading === "delete_products" ? <><Loader2 className="size-4 animate-spin" /> {ar ? "جارٍ الحذف..." : "Deleting..."}</> : ar ? "حذف نهائي" : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DANGER ZONE — Delete All Categories confirmation */}
      <AlertDialog open={dangerOp === "delete_categories"} onOpenChange={(o) => !o && closeDangerDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-[#7f1d1d]">
              {ar ? "حذف كل الفئات؟" : "Delete all categories?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  {ar
                    ? `سيتم حذف ${dbStats?.categories ?? "—"} فئة نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء. المنتجات تخزّن اسم الفئة بشكل مستقل عن سجل الفئة، لذا ستبقى المنتجات كما هي حتى بعد حذف تعريفات الفئات.`
                    : `This will permanently delete ${dbStats?.categories ?? "—"} categor${dbStats?.categories === 1 ? "y" : "ies"} from the database. This action cannot be undone. Products store their category name independently of the Category record, so products can remain even after category definitions are removed.`}
                </p>
                <p>
                  {ar ? (
                    <>اكتب <span className="font-mono font-semibold text-[#dc2626]">DELETE ALL CATEGORIES</span> للتأكيد:</>
                  ) : (
                    <>Type <span className="font-mono font-semibold text-[#dc2626]">DELETE ALL CATEGORIES</span> to confirm:</>
                  )}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            value={dangerConfirmText}
            onChange={(e) => setDangerConfirmText(e.target.value)}
            placeholder="DELETE ALL CATEGORIES"
            className={dangerInputClass}
            disabled={dangerLoading === "delete_categories"}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangerLoading === "delete_categories"}>
              {ar ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); runDangerOperation("delete_categories"); }}
              disabled={dangerConfirmText !== DANGER_CONFIRM_PHRASES.delete_categories || dangerLoading === "delete_categories"}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {dangerLoading === "delete_categories" ? <><Loader2 className="size-4 animate-spin" /> {ar ? "جارٍ الحذف..." : "Deleting..."}</> : ar ? "حذف نهائي" : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DANGER ZONE — Reset Store Database confirmation (strongest guard: typed
          phrase + current admin password verified on the backend) */}
      <AlertDialog open={dangerOp === "reset_store"} onOpenChange={(o) => !o && closeDangerDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl text-[#7f1d1d]">
              {ar ? "إعادة تعيين قاعدة بيانات المتجر؟" : "Reset the store database?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="font-semibold text-[#7f1d1d]">
                  {ar
                    ? "سيتم حذف جميع بيانات المتجر نهائياً — المنتجات، الطلبات، العملاء، التقييمات، المدونة، الفئات، الإعدادات، شرائح البداية، الشهادات، خيارات الشحن، والقسائم."
                    : "This will permanently delete ALL store data — products, orders, customers, reviews, blog posts, categories, settings, hero slides, testimonials, shipping options, and coupons."}
                </p>
                <p>
                  {ar
                    ? "سيبقى حساب المسؤول الحالي دون تغيير وستظل جلستك مسجلة الدخول. لا يمكن التراجع عن هذا الإجراء."
                    : "Your Admin account will remain unchanged and you will stay logged in. This action cannot be undone."}
                </p>
                <p>
                  {ar ? (
                    <>اكتب <span className="font-mono font-semibold text-[#dc2626]">RESET STORE</span> للتأكيد:</>
                  ) : (
                    <>Type <span className="font-mono font-semibold text-[#dc2626]">RESET STORE</span> to confirm:</>
                  )}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              value={dangerConfirmText}
              onChange={(e) => setDangerConfirmText(e.target.value)}
              placeholder="RESET STORE"
              className={dangerInputClass}
              disabled={dangerLoading === "reset_store"}
            />
            <div>
              <Label className="text-[10px] font-semibold text-[#56615b]">
                {ar ? "كلمة مرور المسؤول الحالية" : "Your current admin password"}
              </Label>
              <Input
                type="password"
                value={dangerPassword}
                onChange={(e) => setDangerPassword(e.target.value)}
                placeholder="••••••••"
                className={`mt-1.5 ${dangerInputClass}`}
                disabled={dangerLoading === "reset_store"}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangerLoading === "reset_store"}>
              {ar ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); runDangerOperation("reset_store"); }}
              disabled={
                dangerConfirmText !== DANGER_CONFIRM_PHRASES.reset_store ||
                !dangerPassword ||
                dangerLoading === "reset_store"
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {dangerLoading === "reset_store" ? <><Loader2 className="size-4 animate-spin" /> {ar ? "جارٍ إعادة التعيين..." : "Resetting..."}</> : ar ? "إعادة تعيين المتجر نهائياً" : "Reset Store Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* HERO DIALOG */}
      <Dialog
        open={heroOpen}
        onOpenChange={(open) => {
          if (!open && savingHero) return; // don't allow dismissing mid-save
          setHeroOpen(open);
          if (!open) setEditingHeroId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingHeroId != null ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
            <DialogDescription>
              {editingHeroId != null ? "Update this home-page hero slide, including its image." : "Create a new home-page hero slide."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <ImageUpload label="Hero image" required value={heroForm.image} onChange={(image) => setHeroForm({...heroForm, image})} />
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
            <Button
              variant="outline"
              onClick={() => { setHeroOpen(false); setEditingHeroId(null); }}
              disabled={creating === "hero" || savingHero}
            >
              Cancel
            </Button>
            <Button onClick={saveHero} disabled={creating === "hero" || savingHero}>
              {creating === "hero" || savingHero ? (
                <><Loader2 className="size-4 animate-spin" /> {editingHeroId != null ? "Saving..." : "Creating..."}</>
              ) : editingHeroId != null ? "Save Changes" : "Create Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TESTIMONIAL DIALOG */}
      <Dialog open={testimonialOpen} onOpenChange={(open) => { setTestimonialOpen(open); if (!open) setEditingTestimonialId(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTestimonialId == null ? "Add Testimonial" : "Edit Testimonial"}</DialogTitle>
            <DialogDescription>{editingTestimonialId == null ? "Add a new customer testimonial." : "Update this customer testimonial."}</DialogDescription>
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
            <ImageUpload label="Avatar" value={testimonialForm.avatar} onChange={(avatar) => setTestimonialForm({...testimonialForm, avatar})} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Order</Label><Input type="number" value={testimonialForm.order} onChange={(e) => setTestimonialForm({...testimonialForm, order: Number(e.target.value)})} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="t-active" className="text-sm">Active</Label>
                <Switch id="t-active" checked={testimonialForm.active} onCheckedChange={(v) => setTestimonialForm({...testimonialForm, active: v})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialOpen(false)} disabled={savingTestimonial}>Cancel</Button>
            <Button onClick={saveTestimonial} disabled={savingTestimonial}>
              {savingTestimonial ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : editingTestimonialId == null ? "Create Testimonial" : "Save Changes"}
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
