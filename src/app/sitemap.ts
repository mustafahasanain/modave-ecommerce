import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    db.product.findMany({ where: { status: "active" }, select: { id: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { status: "published" }, select: { id: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/shop", "/collections", "/blog", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.updatedAt,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.id}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
