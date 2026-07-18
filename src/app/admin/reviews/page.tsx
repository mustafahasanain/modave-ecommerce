"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Review { id: string; productId: number; productName: string; author: string; rating: number; title: string | null; body: string; status: string; verified: boolean; createdAt: string; }

export default function AdminReviewsPage() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/reviews${qs}`, { cache: "no-store", signal: controller.signal })
      .then(r => r.json()).then(d => { setReviews(d.reviews || []); setLoading(false); })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, [statusFilter]);

  async function updateStatus(id: string, status: string) { await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); toast.success("Updated"); window.location.reload(); }
  async function confirmDelete() { if (!deleteTarget) return; await fetch(`/api/admin/reviews/${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); window.location.reload(); }

  const stats = { total: reviews.length, approved: reviews.filter(r => r.status === "approved").length, pending: reviews.filter(r => r.status === "pending").length, rejected: reviews.filter(r => r.status === "rejected").length };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><h1 className="font-display text-3xl font-semibold">{ar ? "التقييمات" : "Reviews"}</h1></motion.div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[{l:"Total",v:stats.total},{l:"Approved",v:stats.approved},{l:"Pending",v:stats.pending},{l:"Rejected",v:stats.rejected}].map(s => <Card key={s.l}><CardContent className="p-4"><p className="text-[10px] uppercase text-muted-foreground">{s.l}</p><p className="font-display text-2xl font-semibold">{s.v}</p></CardContent></Card>)}
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle className="font-display text-xl">{ar ? "كل التقييمات" : "All Reviews"} ({reviews.length})</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead className="ps-6 text-[10px] uppercase">Product</TableHead><TableHead className="text-[10px] uppercase">Author</TableHead><TableHead className="text-[10px] uppercase">Rating</TableHead><TableHead className="text-[10px] uppercase">Review</TableHead><TableHead className="text-[10px] uppercase">Status</TableHead><TableHead className="pe-6 text-end text-[10px] uppercase">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? Array.from({length:5}).map((_,i)=><TableRow key={i}><TableCell colSpan={6} className="py-4"><div className="h-4 w-full animate-pulse rounded bg-secondary" /></TableCell></TableRow>) :
              reviews.length === 0 ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No reviews</TableCell></TableRow> :
              reviews.map(r => (
                <TableRow key={r.id} className="text-sm">
                  <TableCell className="ps-6 font-medium">{r.productName}</TableCell>
                  <TableCell>{r.author}{r.verified && <Badge variant="outline" className="ms-1 border-transparent bg-[#fff0f1] text-[#FF2D36] text-[9px]">Verified</Badge>}</TableCell>
                  <TableCell><div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`size-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />)}</div></TableCell>
                  <TableCell className="max-w-xs"><p className="truncate">{r.title && <span className="font-medium">{r.title}: </span>}{r.body}</p></TableCell>
                  <TableCell><Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}><SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></TableCell>
                  <TableCell className="pe-6 text-end"><Button variant="ghost" size="icon" className="size-8 text-[var(--sale)]" onClick={() => setDeleteTarget(r)}><Trash2 className="size-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></div>
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete review?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
