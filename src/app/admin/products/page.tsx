"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Package as PackageIcon } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FormState = {
  name: string;
  price: string;
  stock: string;
  category: string;
  status: "active" | "draft";
  imageUrl: string;
  description: string;
};

const emptyForm: FormState = {
  name: "",
  price: "",
  stock: "",
  category: "Clothing",
  status: "active",
  imageUrl: "",
  description: "",
};

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const { t, locale } = useLanguage();
  const { products: allProducts, loading, createProduct, updateProduct, deleteProduct } = useAdminProducts();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Categories derived from product list (deduped)
  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.category))).sort(),
    [allProducts]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? allProducts.filter((p) => {
          const name = (locale === "ar" ? p.nameAr : p.name).toLowerCase();
          return (
            name.includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        })
      : allProducts;
    return list;
  }, [search, locale, allProducts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: locale === "ar" ? p.nameAr : p.name,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      status: (p.status as "active" | "draft") || "active",
      imageUrl: p.images?.[0] ?? "",
      description: locale === "ar" ? (p.descriptionAr ?? "") : (p.description ?? ""),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    setSaving(true);
    try {
      // Build the images array: use the provided URL, or a placeholder
      const images = form.imageUrl.trim()
        ? [form.imageUrl.trim()]
        : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"];
      const payload = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        status: form.status,
        images,
        description: form.description,
      };
      if (editing) {
        const ok = await updateProduct(editing.id, payload);
        if (ok) toast.success(`"${form.name}" updated successfully`);
        else toast.error("Failed to update product");
      } else {
        const ok = await createProduct(payload);
        if (ok) toast.success(`"${form.name}" added to catalog`);
        else toast.error("Failed to create product");
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const name = locale === "ar" ? deleteTarget.nameAr : deleteTarget.name;
    const ok = await deleteProduct(deleteTarget.id);
    if (ok) toast.success(`"${name}" has been deleted`);
    else toast.error("Failed to delete product");
    setDeleteTarget(null);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {t.admin.dashboard}
          </span>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.admin.products}
          </h1>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="size-4" />
          {t.admin.addProduct}
        </Button>
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <CardTitle className="font-display text-xl">
              {locale === "ar" ? "كل المنتجات" : "All Products"}
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  locale === "ar" ? "بحث عن منتج..." : "Search products..."
                }
                className="ps-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="ps-6 text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.name}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      SKU
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.price}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.stock}
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
                        <TableCell colSpan={6} className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-11 shrink-0 animate-pulse rounded-md bg-secondary" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-40 animate-pulse rounded bg-secondary" />
                              <div className="h-2.5 w-24 animate-pulse rounded bg-secondary" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <PackageIcon className="size-8 opacity-40" />
                          <p className="text-sm">
                            {locale === "ar"
                              ? "لا توجد منتجات مطابقة"
                              : "No products found"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((p) => {
                      const name = locale === "ar" ? p.nameAr : p.name;
                      const status = (p.status as "active" | "draft") || (p.id % 3 === 0 ? "draft" : "active");
                      return (
                        <TableRow key={p.id} className="text-sm">
                          <TableCell className="ps-6">
                            <div className="flex items-center gap-3">
                              <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-secondary">
                                <Image
                                  src={p.images[0]}
                                  alt={name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {locale === "ar" ? p.categoryAr : p.category}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {p.sku}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(p.price)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                p.stock < 15
                                  ? "text-[var(--sale)] font-medium"
                                  : ""
                              }
                            >
                              {p.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                status === "active"
                                  ? "border-transparent bg-foreground/5 text-foreground"
                                  : "border-transparent bg-secondary text-muted-foreground"
                              }
                            >
                              {status === "active" ? t.admin.active : t.admin.draft}
                            </Badge>
                          </TableCell>
                          <TableCell className="pe-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => openEdit(p)}
                                aria-label="Edit product"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeleteTarget(p)}
                                aria-label="Delete product"
                              >
                                <Trash2 className="size-4" />
                              </Button>
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
                  ? `صفحة ${currentPage} من ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4 rtl-flip" />
                  {locale === "ar" ? "السابق" : "Prev"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {locale === "ar" ? "التالي" : "Next"}
                  <ChevronRight className="size-4 rtl-flip" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? t.admin.editProduct : t.admin.addProduct}
            </DialogTitle>
            <DialogDescription>
              {locale === "ar"
                ? "املأ تفاصيل المنتج أدناه."
                : "Fill in the product details below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-xs uppercase tracking-widest">
                {t.admin.name}
              </Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={locale === "ar" ? "اسم المنتج" : "Product name"}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price" className="text-xs uppercase tracking-widest">
                  {t.admin.price}
                </Label>
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock" className="text-xs uppercase tracking-widest">
                  {t.admin.stock}
                </Label>
                <Input
                  id="p-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">
                  {t.admin.categories}
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">
                  {t.admin.status}
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as "active" | "draft" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.admin.active}</SelectItem>
                    <SelectItem value="draft">{t.admin.draft}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL with live preview */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest">
                {locale === "ar" ? "رابط الصورة" : "Image URL"}
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {form.imageUrl.trim() ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      {locale === "ar" ? "لا صورة" : "No img"}
                    </div>
                  )}
                </div>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 text-sm"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {locale === "ar"
                  ? "الصق رابط صورة المنتج. تظهر معاينة على اليسار."
                  : "Paste a product image URL. Preview shows on the left."}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest">
                {locale === "ar" ? "الوصف" : "Description"}
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={
                  locale === "ar"
                    ? "وصف قصير للمنتج..."
                    : "A short product description..."
                }
                rows={3}
                className="text-sm"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? locale === "ar"
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : editing
                  ? locale === "ar"
                    ? "حفظ"
                    : "Save Changes"
                  : t.admin.addProduct}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">
              {locale === "ar" ? "تأكيد الحذف" : "Delete product?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar"
                ? `سيتم حذف "${deleteTarget?.nameAr}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                : `"${
                    deleteTarget ? deleteTarget.name : ""
                  }" will be permanently removed. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {locale === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
