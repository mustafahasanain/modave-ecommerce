"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [form, setForm] = useState({ name: "", nameAr: "", slug: "", image: "", itemCount: "12", active: true });

  const refetch = useCallback(async () => { setLoading(true); try { const res = await fetch("/api/admin/categories", { cache: "no-store" }); const d = await res.json(); setCats(d.categories || []); } catch {} setLoading(false); }, []);
  useEffect(() => { refetch(); }, [refetch]);

  function openAdd() { setEditing(null); setForm({ name: "", nameAr: "", slug: "", image: "", itemCount: "12", active: true }); setDialogOpen(true); }
  function openEdit(c: Category) { setEditing(c); setForm({ name: c.name, nameAr: c.nameAr, slug: c.slug, image: c.image, itemCount: String(c.itemCount), active: c.active }); setDialogOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      if (editing) { const res = await fetch(`/api/admin/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug }) }); if (res.ok) toast.success("Updated"); }
      else { const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug }) }); if (res.ok) toast.success("Created"); }
      setDialogOpen(false); refetch();
    } finally { setSaving(false); }
  }

  async function confirmDelete() { if (!deleteTarget) return; await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); refetch(); }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">{ar ? "الفئات" : "Categories"}</h1>
        <Button onClick={openAdd} className="gap-2"><Plus className="size-4" />{ar ? "إضافة" : "Add"}</Button>
      </motion.div>
      {loading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-40 animate-pulse rounded-lg bg-secondary" />)}</div> :
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cats.map((c) => (
          <Card key={c.id} className="overflow-hidden group">
            <div className="relative aspect-square bg-secondary">{c.image && <img src={c.image} alt={c.name} className="h-full w-full object-cover" />}<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100"><Button size="icon" variant="ghost" className="size-9 bg-background" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="size-9 bg-background text-[var(--sale)]" onClick={() => setDeleteTarget(c)}><Trash2 className="size-4" /></Button></div></div>
            <CardContent className="p-3"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.itemCount} items · {c.slug}</p><Badge variant="outline" className={`mt-1 ${c.active ? "border-transparent bg-foreground/5" : "border-transparent bg-secondary"}`}>{c.active ? "Active" : "Inactive"}</Badge></CardContent>
          </Card>
        ))}
      </div>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label className="text-xs uppercase">Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div><Label className="text-xs uppercase">Name (Arabic)</Label><Input value={form.nameAr} onChange={(e) => setForm({...form, nameAr: e.target.value})} dir="rtl" /></div>
            <div><Label className="text-xs uppercase">Slug</Label><Input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} placeholder="auto-generated" /></div>
            <ImageUpload label="Category image" value={form.image} onChange={(image) => setForm({...form, image})} />
            <div><Label className="text-xs uppercase">Item Count</Label><Input type="number" value={form.itemCount} onChange={(e) => setForm({...form, itemCount: e.target.value})} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} /><Label htmlFor="active">Active</Label></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete category?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
