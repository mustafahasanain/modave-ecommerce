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

const sizes = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  {
    id: 1,
    name: "V-neck cotton T-shirt",
    nameAr: "تي شيرت قطني بياقة V",
    category: "Clothing",
    categoryAr: "ملابس",
    price: 59.99,
    rating: 4.8,
    reviews: 134,
    sold: 18,
    images: [img.tee1, img.tee2, img.knit, img.blouse],
    colors: [colors.gray, colors.beige, colors.black],
    sizes,
    description:
      "Nodding to retro styles, this Hyperbola T-shirt is defined by its off-the-shoulder design. Spun from a stretch cotton jersey and adorned with an embroidered logo. Thick knitted fabric. Short design. Straight design. Rounded neck. Sleeveless.",
    descriptionAr:
      "تي شيرت بتصميم مستوحى من الإطلالات الريترو، يتميز بياقة V مريحة. مصنوع من قطيسة جيرسي مطاطية مع شعار مطرز. قماش محبوك سميك. تصميم قصير. ياقة دائرية. بدون أكمام.",
    vendor: "Modave",
    sku: "53453412",
    stock: 24,
    featured: true,
    newArrival: true,
  },
  {
    id: 2,
    name: "Polarized sunglasses",
    nameAr: "نظارات شمسية مستقطبة",
    category: "Accessories",
    categoryAr: "إكسسوارات",
    price: 79.99,
    originalPrice: 98.0,
    discount: 25,
    rating: 4.9,
    reviews: 89,
    sold: 32,
    images: [img.sunglasses, img.watch, img.earrings],
    colors: [colors.black, colors.brown],
    sizes: [],
    description:
      "Polarized lenses with a lightweight acetate frame. Designed for everyday wear with full UV400 protection and a timeless silhouette.",
    descriptionAr:
      "عدسات مستقطبة بإطار أسيتات خفيف الوزن. مصممة للاستخدام اليومي مع حماية كاملة UV400 وتصميم خالد.",
    vendor: "Modave",
    sku: "53453413",
    stock: 40,
    badge: "sale",
    bestSeller: true,
  },
  {
    id: 3,
    name: "Ramie shirt with pockets",
    nameAr: "قميص رامي بجيوب",
    category: "Clothing",
    categoryAr: "ملابس",
    price: 89.99,
    originalPrice: 98.0,
    discount: 25,
    rating: 4.7,
    reviews: 56,
    sold: 21,
    images: [img.shirt, img.blouse, img.tee2],
    colors: [colors.cream, colors.olive, colors.beige],
    sizes,
    description:
      "A breezy ramie-blend shirt with chest pockets and a relaxed fit. Perfect for warm-weather layering and effortless everyday style.",
    descriptionAr:
      "قميص خفيف من خليط الرامي بجيوب صدرية وقصّة مريحة. مثالي للطبقات في الطقس الدافئ ولإطلالة يومية أنيقة.",
    vendor: "Modave",
    sku: "53453414",
    stock: 18,
    badge: "sale",
    featured: true,
  },
  {
    id: 4,
    name: "Ribbed cotton-blend top",
    nameAr: "بلوزة قطنية مضلعة",
    category: "Clothing",
    categoryAr: "ملابس",
    price: 69.99,
    rating: 4.6,
    reviews: 74,
    sold: 14,
    images: [img.top, img.blouse, img.tee1],
    colors: [colors.white, colors.gray, colors.rust],
    sizes,
    description:
      "A figure-skimming ribbed top in a soft cotton blend. Features a round neckline and a clean, versatile silhouette for everyday wear.",
    descriptionAr:
      "بلوزة مضلعة تتناسب مع القوام من خليط قطني ناعم. تتميز بياقة دائرية وتصميم أنيق متعدد الاستخدامات للاستخدام اليومي.",
    vendor: "Modave",
    sku: "53453415",
    stock: 30,
    newArrival: true,
    bestSeller: true,
  },
  {
    id: 5,
    name: "Belted Manteco coat",
    nameAr: "معطف مانتكو بحزام",
    category: "Outerwear",
    categoryAr: "ملابس خارجية",
    price: 219.99,
    originalPrice: 289.0,
    discount: 24,
    rating: 4.9,
    reviews: 42,
    sold: 9,
    images: [img.coat, img.trench, img.jacket],
    colors: [colors.beige, colors.brown, colors.black],
    sizes,
    description:
      "A tailored wool-blend coat with a self-tie belt and refined lapels. Cut from premium Manteco fabric for timeless elegance.",
    descriptionAr:
      "معطف صوف بقصّة أنيقة وحزام ذاتي الربط وياقات راقية. مصنوع من قماش مانتكو الفاخر لأناقة خالدة.",
    vendor: "Modave",
    sku: "53453416",
    stock: 12,
    badge: "sale",
    featured: true,
  },
  {
    id: 6,
    name: "Faux-leather trousers",
    nameAr: "بنطال جلد صناعي",
    category: "Bottoms",
    categoryAr: "بناطيل",
    price: 129.99,
    rating: 4.5,
    reviews: 38,
    sold: 12,
    images: [img.trousers, img.denim, img.skirt],
    colors: [colors.black, colors.brown],
    sizes,
    description:
      "High-waist faux-leather trousers with a flattering straight leg. A modern essential with a soft, supple handfeel.",
    descriptionAr:
      "بنطال جلد صناعي بخصر عالٍ ورجل مستقيمة أنيقة. قطعة عصرية أساسية بملمس ناعم.",
    vendor: "Modave",
    sku: "53453417",
    stock: 22,
    bestSeller: true,
  },
  {
    id: 7,
    name: "Belt wrap dress",
    nameAr: "فستان ملفوف بحزام",
    category: "Dresses",
    categoryAr: "فساتين",
    price: 159.99,
    originalPrice: 199.0,
    discount: 20,
    rating: 4.8,
    reviews: 61,
    sold: 17,
    images: [img.dress, img.blouse, img.skirt],
    colors: [colors.olive, colors.rust, colors.black],
    sizes,
    description:
      "A fluid wrap dress with a tie waist and flattering V-neck. Crafted from a draping fabric that moves beautifully.",
    descriptionAr:
      "فستان ملفوف انسيابي بحزام ربط وياقة V أنيقة. مصنوع من قماش منسدل يتحرك بأناقة.",
    vendor: "Modave",
    sku: "53453418",
    stock: 16,
    badge: "sale",
    newArrival: true,
  },
  {
    id: 8,
    name: "Double-button trench coat",
    nameAr: "معطف ترنش بأزرار مزدوجة",
    category: "Outerwear",
    categoryAr: "ملابس خارجية",
    price: 249.99,
    originalPrice: 329.0,
    discount: 24,
    rating: 4.9,
    reviews: 33,
    sold: 7,
    images: [img.trench, img.coat, img.jacket],
    colors: [colors.beige, colors.navy, colors.black],
    sizes,
    description:
      "A classic double-breasted trench with storm flap and belted cuffs. A wardrobe staple for transitional seasons.",
    descriptionAr:
      "معطف ترنش كلاسيكي مزدوج الأزرار مع رفّ عاصفة وأساور بحزام. قطعة أساسية للمواسم الانتقالية.",
    vendor: "Modave",
    sku: "53453419",
    stock: 10,
    badge: "sale",
    featured: true,
  },
  {
    id: 9,
    name: "Chunky knit sweater",
    nameAr: "بلوفر محبوك سميك",
    category: "Knitwear",
    categoryAr: "تريكو",
    price: 99.99,
    rating: 4.7,
    reviews: 52,
    sold: 15,
    images: [img.knit, img.sweater, img.cardigan],
    colors: [colors.cream, colors.gray, colors.olive],
    sizes,
    description:
      "An oversized chunky knit sweater in a cozy wool blend. Drop shoulders and ribbed trims for relaxed weekend dressing.",
    descriptionAr:
      "بلوفر محبوك سميك بقصّة واسعة من خليط الصوف. أكتاف منسدلة وحواف مضلعة لإطلالة نهاية الأسبوع المريحة.",
    vendor: "Modave",
    sku: "53453420",
    stock: 20,
    newArrival: true,
  },
  {
    id: 10,
    name: "Tailored blazer jacket",
    nameAr: "بليزر رسمي",
    category: "Outerwear",
    categoryAr: "ملابس خارجية",
    price: 179.99,
    rating: 4.6,
    reviews: 47,
    sold: 11,
    images: [img.jacket, img.coat, img.trench],
    colors: [colors.black, colors.beige],
    sizes,
    description:
      "A structured single-button blazer with a nipped waist. Tailored for a polished, modern silhouette.",
    descriptionAr:
      "بليزر منسق بزر واحد بخصر محدد. مفصّل لإطلالة عصرية أنيقة.",
    vendor: "Modave",
    sku: "53453421",
    stock: 14,
    bestSeller: true,
  },
  {
    id: 11,
    name: "Leather crossbody bag",
    nameAr: "حقيبة جلدية كروس بودي",
    category: "Bags",
    categoryAr: "حقائب",
    price: 149.99,
    rating: 4.8,
    reviews: 65,
    sold: 26,
    images: [img.bag, img.watch, img.earrings],
    colors: [colors.brown, colors.black, colors.beige],
    sizes: [],
    description:
      "A compact leather crossbody bag with an adjustable strap and gold-tone hardware. Designed to carry your essentials in style.",
    descriptionAr:
      "حقيبة جلدية صغيرة بحزام قابل للتعديل وإكسسوارات ذهبية اللون. مصممة لحمل أساسياتك بأناقة.",
    vendor: "Modave",
    sku: "53453422",
    stock: 28,
    newArrival: true,
    featured: true,
  },
  {
    id: 12,
    name: "Minimalist leather sneakers",
    nameAr: "حذاء رياضي جلدي بسيط",
    category: "Shoes",
    categoryAr: "أحذية",
    price: 119.99,
    rating: 4.7,
    reviews: 58,
    sold: 19,
    images: [img.shoes, img.bag, img.watch],
    colors: [colors.white, colors.beige, colors.black],
    sizes: ["38", "39", "40", "41", "42", "43"],
    description:
      "Clean low-top sneakers in smooth leather. A cushioned insole and rubber sole deliver all-day comfort.",
    descriptionAr:
      "حذاء منخفض الرقبة بتصميم نظيف من الجلد الناعم. بطانة مبطّنة ونعل مطاطي لراحة طوال اليوم.",
    vendor: "Modave",
    sku: "53453423",
    stock: 35,
    bestSeller: true,
  },
  {
    id: 13,
    name: "Pleated midi skirt",
    nameAr: "تنورة مطوية ميدي",
    category: "Bottoms",
    categoryAr: "بناطيل",
    price: 89.99,
    rating: 4.5,
    reviews: 29,
    sold: 8,
    images: [img.skirt, img.dress, img.trousers],
    colors: [colors.olive, colors.rust, colors.navy],
    sizes,
    description:
      "A fluid pleated midi skirt with an elasticated waist. Lightweight and gracefully movement with every step.",
    descriptionAr:
      "تنورة ميدي مطوية انسيابية بخصم مطاطي. خفيفة الوزن وتتحرك بأناقة مع كل خطوة.",
    vendor: "Modave",
    sku: "53453424",
    stock: 17,
  },
  {
    id: 14,
    name: "Cashmere blend cardigan",
    nameAr: "كارديجان كشمير",
    category: "Knitwear",
    categoryAr: "تريكو",
    price: 139.99,
    originalPrice: 169.0,
    discount: 18,
    rating: 4.8,
    reviews: 44,
    sold: 13,
    images: [img.cardigan, img.sweater, img.knit],
    colors: [colors.cream, colors.gray, colors.beige],
    sizes,
    description:
      "A soft cashmere-blend cardigan with button closure. Layering perfection with a luxurious handfeel.",
    descriptionAr:
      "كارديجان ناعم من خليط الكشمير بإغلاق بأزرار. مثالي للطبقات بملمس فاخر.",
    vendor: "Modave",
    sku: "53453425",
    stock: 19,
    badge: "sale",
  },
  {
    id: 15,
    name: "Silk wrap blouse",
    nameAr: "بلوزة حرير ملفوفة",
    category: "Clothing",
    categoryAr: "ملابس",
    price: 109.99,
    rating: 4.6,
    reviews: 37,
    sold: 10,
    images: [img.blouse, img.top, img.tee1],
    colors: [colors.white, colors.cream, colors.rust],
    sizes,
    description:
      "A fluid silk-blend wrap blouse with a tie waist and draped collar. Effortlessly elegant from desk to dinner.",
    descriptionAr:
      "بلوزة حرير ملفوفة بحزام ربط وياقة منسدلة. أناقة سهلة من المكتب إلى العشاء.",
    vendor: "Modave",
    sku: "53453426",
    stock: 21,
    newArrival: true,
  },
  {
    id: 16,
    name: "High-rise denim jeans",
    nameAr: "جينز بخصر عالٍ",
    category: "Bottoms",
    categoryAr: "بناطيل",
    price: 99.99,
    rating: 4.7,
    reviews: 71,
    sold: 23,
    images: [img.denim, img.trousers, img.skirt],
    colors: [colors.navy, colors.black],
    sizes,
    description:
      "High-rise straight-leg jeans in rigid denim with a vintage wash. A modern take on a classic five-pocket design.",
    descriptionAr:
      "جينز بخصر عالٍ ورجل مستقيمة من الدنيم الصلب بغسيل عتيق. لمسة عصرية على التصميم الكلاسيكي بخمسة جيوب.",
    vendor: "Modave",
    sku: "53453427",
    stock: 33,
    bestSeller: true,
  },
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
