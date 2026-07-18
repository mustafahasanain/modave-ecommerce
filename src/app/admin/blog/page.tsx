"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, FileText } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";

interface BlogPost { id: number; title: string; titleAr: string; excerpt: string; excerptAr: string; category: string; categoryAr: string; author: string; authorAr: string; date: string; readTime: number; image: string; featured: boolean; status: string; }

export default function AdminBlogPage() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", titleAr: "", excerpt: "", excerptAr: "", category: "Style Guide", categoryAr: "دليل الأسلوب", author: "", authorAr: "", date: new Date().toISOString().slice(0,10), readTime: "5", image: "", featured: false, status: "published" });

  const refetch = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/admin/blog", { cache: "no-store" }); const d = await res.json(); setPosts(d.posts || []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setEditing(null); setForm({ title: "", titleAr: "", excerpt: "", excerptAr: "", category: "Style Guide", categoryAr: "دليل الأسلوب", author: "", authorAr: "", date: new Date().toISOString().slice(0,10), readTime: "5", image: "", featured: false, status: "published" }); setDialogOpen(true); }
  function openEdit(p: BlogPost) { setEditing(p); setForm({ title: p.title, titleAr: p.titleAr || "", excerpt: p.excerpt, excerptAr: p.excerptAr || "", category: p.category, categoryAr: p.categoryAr || "", author: p.author, authorAr: p.authorAr || "", date: p.date, readTime: String(p.readTime), image: p.image, featured: p.featured, status: p.status }); setDialogOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/blog/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) toast.success("Updated"); else toast.error("Failed");
      } else {
        const res = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) toast.success("Created"); else toast.error("Failed");
      }
      setDialogOpen(false); refetch();
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/blog/${deleteTarget.id}`, { method: "DELETE" });
    toast.success("Deleted"); setDeleteTarget(null); refetch();
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e6ece8] bg-white px-4 py-4 shadow-[0_5px_18px_rgba(27,61,46,0.03)] sm:px-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f1] text-[#FF2D36]"><FileText className="size-5" /></span>
        <div><h1 className="font-display text-3xl font-semibold">{ar ? "المدونة" : "Blog Posts"}</h1></div>
        <Button onClick={openAdd} className="gap-2"><Plus className="size-4" />{ar ? "إضافة" : "Add Post"}</Button>
      </motion.div>
      <Card className="overflow-hidden rounded-xl border-[#e6ece8] shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="font-display text-xl">{ar ? "كل المقالات" : "All Posts"} ({filtered.length})</CardTitle>
          <div className="relative w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="ps-9" /></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead className="ps-6 text-[10px] uppercase">Post</TableHead><TableHead className="text-[10px] uppercase">Category</TableHead><TableHead className="text-[10px] uppercase">Date</TableHead><TableHead className="text-[10px] uppercase">Status</TableHead><TableHead className="pe-6 text-end text-[10px] uppercase">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? Array.from({length:5}).map((_,i)=>(<TableRow key={i}><TableCell colSpan={5} className="py-4"><div className="h-4 w-full animate-pulse rounded bg-secondary" /></TableCell></TableRow>)) :
              filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No posts found</TableCell></TableRow> :
              filtered.map((p) => (
                <TableRow key={p.id} className="text-[11px] hover:bg-[#fffafb]">
                  <TableCell className="ps-6"><div className="flex items-center gap-3">{p.image && <img src={p.image} alt="" className="size-10 rounded object-cover" />}<div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.author}</p></div></div></TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-muted-foreground">{p.date}</TableCell>
                  <TableCell><Badge variant="outline" className={p.status === "published" ? "border-transparent bg-foreground/5" : "border-transparent bg-secondary"}>{p.status}</Badge></TableCell>
                  <TableCell className="pe-6 text-end"><Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8" onClick={() => setDeleteTarget(p)}><Trash2 className="size-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></div>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-[#e6ece8] p-5 shadow-2xl">
          <DialogHeader className="gap-1 pe-8"><DialogTitle className="text-[15px] font-semibold">{editing ? "Edit post" : "Add post"}</DialogTitle><DialogDescription className="text-[11px]">Write the essential details for this storefront article.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Title</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required /></div>
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Title (Arabic)</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20" value={form.titleAr} onChange={(e) => setForm({...form, titleAr: e.target.value})} dir="rtl" /></div>
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Excerpt</Label><Textarea className="rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20" value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Category</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Author</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none" value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Date</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Read time (minutes)</Label><Input className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none" type="number" value={form.readTime} onChange={(e) => setForm({...form, readTime: e.target.value})} /></div>
            </div>
            <ImageUpload label="Post image" value={form.image} onChange={(image) => setForm({...form, image})} />
            <div className="space-y-1.5"><Label className="text-[10px] font-semibold text-[#56615b]">Status</Label><Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}><SelectTrigger className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select></div>
            <DialogFooter className="border-t border-[#edf1ee] pt-4"><Button type="button" variant="outline" className="h-9 rounded-lg text-xs" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="h-9 rounded-lg bg-[#FF2D36] text-xs hover:bg-[#e52630]" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add post"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete post?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
