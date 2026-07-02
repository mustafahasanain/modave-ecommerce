export interface BlogPost {
  id: number;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content?: string;
  contentAr?: string;
  category: string;
  categoryAr: string;
  author: string;
  authorAr: string;
  date: string;
  readTime: number;
  image: string;
  featured?: boolean;
}

const img = {
  style1: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
  style2: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80",
  style3: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80",
  style4: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
  style5: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80",
  style6: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=80",
  style7: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=80",
  style8: "https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=80",
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Art of Minimalist Layering",
    titleAr: "فن الطبقات المينيمالية",
    excerpt: "Master the art of layering with our curated guide to effortless transitional dressing — from lightweight knits to tailored outerwear.",
    excerptAr: "أتقن فن الطبقات مع دليلنا المنسّق لإطلالة انتقالية سهلة — من الكنزات الخفيفة إلى الملابس الخارجية المفصّلة.",
    category: "Style Guide",
    categoryAr: "دليل الأسلوب",
    author: "Elena Marchetti",
    authorAr: "إيلينا مارشيتي",
    date: "2026-06-18",
    readTime: 5,
    image: img.style1,
    featured: true,
  },
  {
    id: 2,
    title: "Sustainable Fabres: A Conscious Choice",
    titleAr: "الأقمشة المستدامة: خيار واعٍ",
    excerpt: "Discover how responsibly sourced materials are shaping the future of fashion — one garment at a time.",
    excerptAr: "اكتشف كيف تشكّل المواد المستدامة مستقبل الموضة — قطعة واحدة في كل مرة.",
    category: "Sustainability",
    categoryAr: "الاستدامة",
    author: "Mark Oliveira",
    authorAr: "مارك أوليفيرا",
    date: "2026-06-12",
    readTime: 7,
    image: img.style2,
    featured: true,
  },
  {
    id: 3,
    title: "Capsule Wardrobe Essentials for 2026",
    titleAr: "أساسيات خزانة الكبسولة لعام 2026",
    excerpt: "Build a timeless capsule wardrobe with these 10 versatile pieces that transition seamlessly from desk to dinner.",
    excerptAr: "ابنِ خزانة كبسولة خالدة بهذه القطع العشر متعددة الاستخدامات التي تنتقل بسلاسة من المكتب إلى العشاء.",
    category: "Wardrobe",
    categoryAr: "الخزانة",
    author: "Sarah Chen",
    authorAr: "سارة تشين",
    date: "2026-06-05",
    readTime: 6,
    image: img.style3,
  },
  {
    id: 4,
    title: "The Trench Coat: A Timeless Icon",
    titleAr: "معطف الترنش: أيقونة خالدة",
    excerpt: "From Burberry to the modern runway, explore the enduring appeal of the trench coat and how to style it for every season.",
    excerptAr: "من بربري إلى منصات العصر، استكشف جاذبية معطف الترنش الخالدة وكيفية تنسيقه لكل موسم.",
    category: "Heritage",
    categoryAr: "إرث",
    author: "James Whitfield",
    authorAr: "جيمس ويتفيلد",
    date: "2026-05-28",
    readTime: 4,
    image: img.style4,
  },
  {
    id: 5,
    title: "Color Theory: Building a Cohesive Palette",
    titleAr: "نظرية الألوان: بناء لوحة متناسقة",
    excerpt: "Learn how to combine neutrals, earth tones, and accent colors to create a wardrobe that always looks intentional.",
    excerptAr: "تعلّم كيف تجمع بين المحايدات والألوان الترابية والألوان المميزة لخلق خزانة تبدو مدروسة دائماً.",
    category: "Style Guide",
    categoryAr: "دليل الأسلوب",
    author: "Aisha Rahman",
    authorAr: "عائشة رحمن",
    date: "2026-05-20",
    readTime: 8,
    image: img.style5,
  },
  {
    id: 6,
    title: "Care Guide: Making Your Pieces Last",
    titleAr: "دليل العناية: إطالة عمر قطعك",
    excerpt: "Proper care extends the life of your garments. Our comprehensive guide covers washing, storing, and repairing.",
    excerptAr: "العناية المناسبة تطيل عمر ملابسك. دليلنا الشامل يغطي الغسيل والتخزين والإصلاح.",
    category: "Care",
    categoryAr: "العناية",
    author: "Mark Oliveira",
    authorAr: "مارك أوليفيرا",
    date: "2026-05-14",
    readTime: 5,
    image: img.style6,
  },
  {
    id: 7,
    title: "The Renaissance of Tailoring",
    titleAr: "نهضة التفصيل",
    excerpt: "Tailoring is back — but softer, more relaxed, and infinitely more versatile. Here's how to embrace the new tailoring.",
    excerptAr: "التفصيل عاد — لكن بأسلوب أنعم وأكثر استرخاءً ولا نهائي التنوع. إليك كيف تعتنق التفصيل الجديد.",
    category: "Trends",
    categoryAr: "اتجاهات",
    author: "Elena Marchetti",
    authorAr: "إيلينا مارشيتي",
    date: "2026-05-08",
    readTime: 6,
    image: img.style7,
  },
  {
    id: 8,
    title: "Accessories That Elevate Every Look",
    titleAr: "إكسسوارات ترتقي بكل إطلالة",
    excerpt: "The right accessory transforms an outfit. Discover our edit of bags, belts, and jewellery that make the difference.",
    excerptAr: "الإكسسوار المناسب يحوّل الإطلالة. اكتشف تشكيلتنا من الحقائب والأحزمة والمجوهرات التي تصنع الفارق.",
    category: "Accessories",
    categoryAr: "إكسسوارات",
    author: "Sarah Chen",
    authorAr: "سارة تشين",
    date: "2026-05-01",
    readTime: 4,
    image: img.style8,
  },
];

export function getBlogPost(id: number) {
  return blogPosts.find((p) => p.id === id);
}
