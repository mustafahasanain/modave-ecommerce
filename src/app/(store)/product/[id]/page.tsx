import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getProduct } from "@/data/products";
import ProductDetailClient from "./product-detail-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function loadProduct(id: number) {
  const dbProduct = await db.product.findUnique({ where: { id } });
  if (dbProduct) {
    return {
      name: dbProduct.name,
      description: dbProduct.description,
      images: JSON.parse(dbProduct.images) as string[],
      price: dbProduct.price,
      sku: dbProduct.sku,
      stock: dbProduct.stock,
      rating: dbProduct.rating,
      reviews: dbProduct.reviews,
    };
  }
  const fallback = getProduct(id);
  if (!fallback) return null;
  return {
    name: fallback.name,
    description: fallback.description,
    images: fallback.images,
    price: fallback.price,
    sku: fallback.sku,
    stock: fallback.stock,
    rating: fallback.rating,
    reviews: fallback.reviews,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(Number(id));
  if (!product) return { title: "Product Not Found — Modave" };

  const title = `${product.name} — Modave`;
  const description = product.description?.slice(0, 160) || `Shop ${product.name} at Modave.`;
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${id}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await loadProduct(Number(id));

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.sku,
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${id}`,
          priceCurrency: "USD",
          price: product.price,
          availability:
            product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
        ...(product.reviews > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviews,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // JSON.stringify escapes quotes but not "</script>"; guard against a
          // product description/name containing that sequence.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
