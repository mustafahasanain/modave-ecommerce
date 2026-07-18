"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Layers3 } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";

interface Category { id: number; name: string; nameAr: string; slug: string; image: string; itemCount: number; active: boolean; }

export default function AdminCategoriesPage() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", nameAr: "", slug: "", image: "", active: true });

  const refetch = useCallback(async () => { setLoading(true); try { const res = await fetch("/api/admin/categories", { cache: "no-store" }); const d = await res.json(); setCats(d.categories || []); } catch {} setLoading(false); }, []);
  useEffect(() => { refetch(); }, [refetch]);

  function openAdd() { setEditing(null); setForm({ name: "", nameAr: "", slug: "", image: "", active: true }); setDialogOpen(true); }
  function openEdit(c: Category) { setEditing(c); setForm({ name: c.name, nameAr: c.nameAr, slug: c.slug, image: c.image, active: c.active }); setDialogOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const payload = { ...form, slug };
      const res = editing
        ? await fetch(`/api/admin/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { toast.error(editing ? "Failed to update category" : "Failed to create category"); return; }
      toast.success(editing ? "Updated" : "Created");
      setDialogOpen(false); refetch();
    } finally { setSaving(false); }
  }

  async function confirmDelete() { if (!deleteTarget) return; await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); refetch(); }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e6ece8] bg-white px-4 py-4 shadow-[0_5px_18px_rgba(27,61,46,0.03)] sm:px-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f1] text-[#FF2D36]"><Layers3 className="size-5" /></span>
        <h1 className="font-display text-3xl font-semibold">{ar ? "الفئات" : "Categories"}</h1>
        <Button onClick={openAdd} className="gap-2"><Plus className="size-4" />{ar ? "إضافة" : "Add"}</Button>
      </motion.div>
      {loading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-52 animate-pulse rounded-xl bg-white" />)}</div> :
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {cats.map((c) => (
          <Card key={c.id} className="group overflow-hidden rounded-xl border-[#e6ece8] bg-white shadow-[0_5px_18px_rgba(27,61,46,0.03)] transition-all hover:-translate-y-0.5 hover:border-[#ffd8da] hover:shadow-md hover:shadow-red-950/5">
            <div className="relative aspect-square bg-secondary">{c.image && <img src={c.image} alt={c.name} className="h-full w-full object-cover" />}<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100"><Button size="icon" variant="ghost" className="size-9 bg-background" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="size-9 bg-background text-[var(--sale)]" onClick={() => setDeleteTarget(c)}><Trash2 className="size-4" /></Button></div></div>
            <CardContent className="p-3"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.itemCount} items · {c.slug}</p><Badge variant="outline" className={`mt-1 ${c.active ? "border-transparent bg-foreground/5" : "border-transparent bg-secondary"}`}>{c.active ? "Active" : "Inactive"}</Badge></CardContent>
          </Card>
        ))}
      </div>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-[#e6ece8] p-5 shadow-2xl">
          <DialogHeader className="gap-1 pe-8"><DialogTitle className="text-[15px] font-semibold">{editing ? "Edit category" : "Add category"}</DialogTitle><DialogDescription className="text-[11px]">Set the name, route, and visibility for this product group.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Name</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Name (Arabic)</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20" value={form.nameAr} onChange={(e) => setForm({...form, nameAr: e.target.value})} dir="rtl" /></div>
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Slug</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} placeholder="Auto-generated from name" /></div>
            <ImageUpload label="Category image" value={form.image} onChange={(image) => setForm({...form, image})} />
            <div className="flex items-center justify-between rounded-lg border border-[#e6ece8] bg-[#fbfdfc] px-3 py-2.5"><div><Label htmlFor="active" className="text-[11px] font-semibold text-[#37433d]">Active category</Label><p className="mt-0.5 text-[9px] text-[#87918c]">Show this category on the storefront.</p></div><Switch id="active" checked={form.active} onCheckedChange={(active) => setForm({...form, active})} /></div>
            <DialogFooter className="border-t border-[#edf1ee] pt-4"><Button type="button" variant="outline" className="h-9 rounded-lg text-xs" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="h-9 rounded-lg bg-[#FF2D36] text-xs hover:bg-[#e52630]" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add category"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete category?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
