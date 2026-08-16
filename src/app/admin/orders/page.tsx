"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { useAdminOrders, type AdminOrder } from "@/hooks/use-admin-orders";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type OrderStatus = "paid" | "pending" | "cancelled";

function parseItems(itemsJson: string): number {
  try {
    const arr = JSON.parse(itemsJson) as { quantity?: number }[];
    return arr.reduce((sum, i) => sum + (i.quantity ?? 1), 0);
  } catch {
    return 0;
  }
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const { orders, loading, refetch } = useAdminOrders(statusFilter);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteInProgress = useRef(false);

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(
          locale === "ar" ? "تم تحديث حالة الطلب" : "Order status updated"
        );
        refetch();
      } else {
        toast.error(locale === "ar" ? "فشل التحديث" : "Failed to update");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function openDetail(orderId: string) {
    setDetailOrderId(orderId);
    setDetailOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteInProgress.current) return;
    deleteInProgress.current = true;
    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/orders/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(
          locale === "ar" ? "تم حذف الطلب نهائياً" : "Order permanently deleted"
        );
        setDeleteTarget(null);
        refetch();
      } else {
        const data = await res.json().catch(() => null);
        const fallback =
          locale === "ar" ? "فشل حذف الطلب" : "Failed to delete order";
        toast.error(
          locale === "ar"
            ? res.status === 404
              ? "الطلب غير موجود"
              : res.status === 409
                ? "يمكن حذف الطلبات الملغاة فقط"
                : fallback
            : data?.error ?? fallback
        );
      }
    } catch {
      toast.error(locale === "ar" ? "فشل حذف الطلب" : "Failed to delete order");
    } finally {
      deleteInProgress.current = false;
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [search, orders]);

  // Compute stats from loaded orders
  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.status === "paid").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return { total, paid, pending, cancelled };
  }, [orders]);

  function exportCsv() {
    const headers = ["Order Number", "Customer", "Email", "Date", "Items", "Total", "Status"];
    const rows = filtered.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      formatDate(o.createdAt, locale),
      String(parseItems(o.items)),
      String(o.total),
      o.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modave-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(
      locale === "ar" ? `تم تصدير ${filtered.length} طلب` : `Exported ${filtered.length} orders`
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {t.admin.dashboard}
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.admin.orders}
        </h1>
      </motion.div>

      {/* Stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { label: t.admin.totalOrders, value: String(stats.total) },
          { label: "Paid", value: String(stats.paid) },
          { label: "Pending", value: String(stats.pending) },
          { label: "Cancelled", value: String(stats.cancelled) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <CardTitle className="font-display text-xl">
              {locale === "ar" ? "كل الطلبات" : "All Orders"}
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            </CardTitle>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    locale === "ar" ? "بحث بالطلب أو العميل..." : "Search order or customer..."
                  }
                  className="ps-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | OrderStatus)}
              >
                <SelectTrigger className="w-32 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === "ar" ? "الكل" : "All"}
                  </SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                className="gap-2 shrink-0"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">
                  {locale === "ar" ? "تصدير" : "Export CSV"}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="ps-6 text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.order}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.customer}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.date}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {locale === "ar" ? "العناصر" : "Items"}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.amount}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.status}
                    </TableHead>
                    <TableHead className="pe-6 text-end text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        <TableCell colSpan={7} className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
                            <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
                            <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                        {locale === "ar" ? "لا توجد طلبات مطابقة" : "No orders found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((o: AdminOrder) => {
                      return (
                        <TableRow key={o.id} className="text-sm">
                          <TableCell className="ps-6 font-mono font-medium">
                            {o.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{o.customerName}</div>
                            <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(o.createdAt, locale)}
                          </TableCell>
                          <TableCell>{parseItems(o.items)}</TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(o.total)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={o.status}
                              disabled={updatingId === o.id}
                              onValueChange={(v) => updateOrderStatus(o.id, v as OrderStatus)}
                            >
                              <SelectTrigger className="h-7 w-28 border-transparent bg-foreground/5 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="pe-6 text-end">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => openDetail(o.id)}
                                aria-label="View order"
                              >
                                <Eye className="size-4" />
                              </Button>
                              {o.status === "cancelled" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget(o)}
                                  disabled={deletingId === o.id}
                                  aria-label={
                                    locale === "ar" ? "حذف الطلب" : "Delete order"
                                  }
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {locale === "ar"
                  ? `عرض ${filtered.length} من ${orders.length} طلب`
                  : `Showing ${filtered.length} of ${orders.length} orders`}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="gap-1" disabled>
                  <ChevronLeft className="size-4 rtl-flip" />
                  {locale === "ar" ? "السابق" : "Prev"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1" disabled>
                  {locale === "ar" ? "التالي" : "Next"}
                  <ChevronRight className="size-4 rtl-flip" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Order detail dialog (keyed by orderId so state resets per order) */}
      <OrderDetailDialog
        key={detailOrderId ?? "none"}
        orderId={detailOrderId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) =>
          !o && !deleteInProgress.current && setDeleteTarget(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">
              {locale === "ar" ? "تأكيد الحذف" : "Delete order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar"
                ? `سيتم حذف الطلب "${deleteTarget?.orderNumber}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `Order "${deleteTarget?.orderNumber}" will be permanently removed. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingId !== null}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingId
                ? locale === "ar"
                  ? "جارٍ الحذف..."
                  : "Deleting..."
                : locale === "ar"
                  ? "حذف"
                  : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
