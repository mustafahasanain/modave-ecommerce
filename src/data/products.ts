export interface Product {
  id: number;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  sold: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  descriptionAr: string;
  badge?: "sale" | "new" | "hot";
  vendor: string;
  sku: string;
  stock: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  status?: "active" | "draft";
}

// Curated Unsplash fashion photography (stable photo IDs)
const img = {
  tee1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  tee2: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
  sunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
  shirt: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
  top: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80",
  coat: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
  dress: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  trousers: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80",
  knit: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  jacket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  bag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
  shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
  skirt: "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=800&q=80",
  sweater: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
  blouse: "https://images.unsplash.com/photo-1485231183945-fffde7cc051e?w=800&q=80",
  denim: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  cardigan: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
  trench: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
  earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
};

export const colors = {
  gray: { name: "Gray", hex: "#9ca3af" },
  beige: { name: "Beige", hex: "#e7d7c1" },
  black: { name: "Black", hex: "#1a1a1a" },
  white: { name: "White", hex: "#f5f5f0" },
  brown: { name: "Brown", hex: "#6b4f3a" },
  olive: { name: "Olive", hex: "#6b6b3a" },
  cream: { name: "Cream", hex: "#ede4d3" },
  navy: { name: "Navy", hex: "#2b3a4a" },
  rust: { name: "Rust", hex: "#9c4a2a" },
};

export const products: Product[] = [
];

export const collections = [
  { name: "Men's", nameAr: "رجال", count: 12, image: img.shirt },
  { name: "Women's", nameAr: "نساء", count: 12, image: img.dress },
  { name: "Kid's", nameAr: "أطفال", count: 12, image: img.knit },
  { name: "Jewelry", nameAr: "مجوهرات", count: 12, image: img.earrings },
  { name: "Dresses", nameAr: "فساتين", count: 12, image: img.dress },
  { name: "Tops", nameAr: "بلوزات", count: 12, image: img.top },
  { name: "Bottoms", nameAr: "بناطيل", count: 12, image: img.trousers },
  { name: "Outerwear", nameAr: "ملابس خارجية", count: 12, image: img.coat },
  { name: "Shoes", nameAr: "أحذية", count: 12, image: img.shoes },
  { name: "Bags", nameAr: "حقائب", count: 12, image: img.bag },
  { name: "Accessories", nameAr: "إكسسوارات", count: 12, image: img.watch },
  { name: "Lingerie", nameAr: "ملابس داخلية", count: 12, image: img.blouse },
];

export function getProduct(id: number) {
  return products.find((p) => p.id === id);
}

export function getRelated(id: number, limit = 4) {
  const current = getProduct(id);
  if (!current) return products.slice(0, limit);
  return products.filter((p) => p.id !== id).slice(0, limit);
}
