"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Package as PackageIcon, Boxes } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { ImageUpload } from "@/components/admin/image-upload";
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
      // Store only an image deliberately selected by the administrator.
      const images = form.imageUrl.trim()
        ? [form.imageUrl.trim()]
        : [];
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
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 rounded-xl border border-[#e6ece8] bg-white px-4 py-4 shadow-[0_5px_18px_rgba(27,61,46,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f1] text-[#FF2D36]"><Boxes className="size-5" /></span>
          <div>
            <h1 className="text-[14px] font-semibold text-[#1b241f]">{t.admin.products}</h1>
            <p className="mt-0.5 text-[10px] text-[#87918c]">Manage your catalog, inventory, and product availability.</p>
          </div>
        </div>
        <Button onClick={openAdd} className="h-9 rounded-lg bg-[#FF2D36] px-3.5 text-[11px] font-semibold text-white hover:bg-[#e52630]">
          <Plus className="size-3.5" />
          {t.admin.addProduct}
        </Button>
      </motion.div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
          <Card className="overflow-hidden rounded-xl border-[#e6ece8] shadow-[0_5px_18px_rgba(27,61,46,0.03)]">
          <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 border-b border-[#edf1ee] px-4 py-4 sm:flex-nowrap sm:px-5">
            <CardTitle className="text-[13px] font-semibold text-[#1b241f]">
              {locale === "ar" ? "كل المنتجات" : "All Products"}
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#8c9691]" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  locale === "ar" ? "بحث عن منتج..." : "Search products..."
                }
                className="h-9 rounded-lg border-[#dfe8e2] bg-white ps-9 text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20"
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
                        <TableRow key={p.id} className="text-[11px] hover:bg-[#fffafb]">
                          <TableCell className="ps-6">
                            <div className="flex items-center gap-3">
                              <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f1f4f2] text-[#9ba59f]">
                                {p.images?.[0] ? (
                                  <Image
                                    src={p.images[0]}
                                    alt={name}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <PackageIcon className="size-4" strokeWidth={1.5} />
                                )}
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
                            <Badge variant="outline" className={status === "active" ? "border-transparent bg-[#fff0f1] text-[#FF2D36] text-[9px]" : "border-transparent bg-[#f1f4f2] text-[#748078] text-[9px]"}>
                              {status === "active" ? t.admin.active : t.admin.draft}
                            </Badge>
                          </TableCell>
                          <TableCell className="pe-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg hover:bg-[#fff0f1] hover:text-[#FF2D36]"
                                onClick={() => openEdit(p)}
                                aria-label="Edit product"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:bg-[#fff0f1] hover:text-[#FF2D36]"
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
            <div className="flex items-center justify-between gap-3 border-t border-[#edf1ee] px-4 py-3 sm:px-5">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-[#e6ece8] p-5 shadow-2xl sm:max-w-[620px]">
          <DialogHeader className="pe-8">
            <DialogTitle className="text-[15px] font-semibold">
              {editing ? t.admin.editProduct : t.admin.addProduct}
            </DialogTitle>
            <DialogDescription>
              {locale === "ar"
                ? "املأ تفاصيل المنتج أدناه."
                : "Fill in the product details below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-[10px] font-semibold text-[#56615b]">
                {t.admin.name}
              </Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={locale === "ar" ? "اسم المنتج" : "Product name"}
                required
                className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price" className="text-[10px] font-semibold text-[#56615b]">
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
                  className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock" className="text-[10px] font-semibold text-[#56615b]">
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
                  className="h-10 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-[#56615b]">
                  {t.admin.categories}
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border-[#dfe8e2] text-xs shadow-none">
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
                <Label className="text-[10px] font-semibold text-[#56615b]">
                  {t.admin.status}
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as "active" | "draft" })
                  }
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border-[#dfe8e2] text-xs shadow-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.admin.active}</SelectItem>
                    <SelectItem value="draft">{t.admin.draft}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUpload
              label={locale === "ar" ? "Upload product image" : "Upload product image"}
              value={form.imageUrl}
              onChange={(imageUrl) => setForm({ ...form, imageUrl })}
            />

            {/* Image URL with live preview */}
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold text-[#56615b]">
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
                  className="h-10 flex-1 rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20"
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
              <Label className="text-[10px] font-semibold text-[#56615b]">
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
                className="rounded-lg border-[#dfe8e2] text-xs shadow-none focus-visible:border-[#FF2D36] focus-visible:ring-[#FF2D36]/20"
              />
            </div>
            <DialogFooter className="border-t border-[#edf1ee] pt-4">
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
