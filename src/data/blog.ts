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

const blogImages = {
  trench: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80",
  shirt: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&q=80",
  dress: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&q=80",
  knit: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000&q=80",
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "How to Build a Timeless Capsule Wardrobe",
    titleAr: "كيف تبنين خزانة كبسولية تدوم",
    excerpt: "A practical guide to choosing versatile pieces you will reach for season after season.",
    excerptAr: "دليل عملي لاختيار قطع مرنة تعتمدين عليها موسماً بعد موسم.",
    content: "A timeless wardrobe starts with fewer, better pieces. Begin with a neutral base, add texture through knitwear and tailoring, then introduce one or two accent colours that feel personal to you. The goal is not a strict uniform—it is a collection where every item earns its place and works with several others.",
    contentAr: "تبدأ الخزانة الخالدة بعدد أقل من القطع ذات الجودة الأعلى. ابدئي بالألوان الحيادية، ثم أضيفي الملمس من خلال الملابس المحبوكة والقصات الرسمية، واختاري لوناً أو لونين يعبران عن ذوقك. الهدف ليس زياً موحداً، بل مجموعة تستحق كل قطعة فيها مكانها ويمكن تنسيقها بأكثر من طريقة.",
    category: "Style Guide",
    categoryAr: "دليل الأسلوب",
    author: "Modave Editorial",
    authorAr: "فريق موديف",
    date: "2026-08-12",
    readTime: 6,
    image: blogImages.trench,
    featured: true,
  },
  {
    id: 2,
    title: "The Fabrics Worth Knowing This Season",
    titleAr: "الخامات التي تستحق اهتمامك هذا الموسم",
    excerpt: "From breathable linen to fluid satin, discover how fabric changes the way a piece looks and feels.",
    excerptAr: "من الكتان المنعش إلى الساتان الانسيابي، اكتشفي كيف تغيّر الخامة شكل القطعة وإحساسها.",
    content: "Fabric is the foundation of every good garment. Linen stays breathable in warm weather, cotton brings everyday comfort, satin creates elegant movement, and wool blends provide warmth without unnecessary weight. Check the care label and choose the texture that suits how often you plan to wear the piece.",
    contentAr: "الخامة هي أساس كل قطعة جيدة. يمنح الكتان تهوية مناسبة للأجواء الدافئة، ويوفر القطن الراحة اليومية، ويضيف الساتان حركة أنيقة، بينما تمنح خلطات الصوف الدفء من دون وزن زائد. راجعي تعليمات العناية واختاري الملمس الذي يناسب استخدامك للقطعة.",
    category: "Materials",
    categoryAr: "الخامات",
    author: "Lina Kareem",
    authorAr: "لينا كريم",
    date: "2026-08-07",
    readTime: 5,
    image: blogImages.shirt,
  },
  {
    id: 3,
    title: "Three Effortless Looks for a Busy Week",
    titleAr: "ثلاث إطلالات سهلة لأسبوع مزدحم",
    excerpt: "Simple outfit formulas for workdays, casual plans, and an evening out.",
    excerptAr: "تنسيقات بسيطة لأيام العمل والمشاوير اليومية والأمسيات.",
    content: "For work, pair wide-leg trousers with a satin blouse and clean leather shoes. On a casual day, style a cotton tee with denim and a soft cardigan. For evening plans, a wrap dress only needs sculptural earrings and a compact bag. Repeating reliable formulas makes getting dressed quicker without making your style feel repetitive.",
    contentAr: "للعمل، نسقي البنطال الواسع مع بلوزة ساتان وحذاء جلدي بسيط. وفي اليوم العملي اختاري تيشيرتاً قطنياً مع الدنيم وكارديغان ناعم. أما المساء، فيكفي الفستان اللف مع أقراط بارزة وحقيبة صغيرة. اعتماد تنسيقات موثوقة يختصر الوقت من دون أن يجعل أسلوبك متكرراً.",
    category: "Inspiration",
    categoryAr: "إلهام",
    author: "Noor Hassan",
    authorAr: "نور حسن",
    date: "2026-07-29",
    readTime: 4,
    image: blogImages.dress,
  },
  {
    id: 4,
    title: "Care Tips That Keep Your Clothes Looking New",
    titleAr: "نصائح تحافظ على ملابسك كأنها جديدة",
    excerpt: "Small changes in washing, drying, and storage can add years to your favourite pieces.",
    excerptAr: "تغييرات بسيطة في الغسل والتجفيف والتخزين تطيل عمر قطعك المفضلة.",
    content: "Wash less often when possible, use cool water, and turn delicate garments inside out. Air-dry knitwear flat to preserve its shape and give coats room to breathe on sturdy hangers. Before storing seasonal pieces, clean them and keep them away from direct sunlight and moisture.",
    contentAr: "قللي عدد مرات الغسل قدر الإمكان، واستخدمي الماء البارد، واقلبي القطع الحساسة قبل غسلها. جففي الملابس المحبوكة بشكل مسطح للحفاظ على شكلها، وعلقي المعاطف على علاقات متينة. نظفي القطع الموسمية قبل تخزينها واحفظيها بعيداً عن الشمس والرطوبة.",
    category: "Care",
    categoryAr: "العناية",
    author: "Modave Editorial",
    authorAr: "فريق موديف",
    date: "2026-07-20",
    readTime: 5,
    image: blogImages.knit,
  },
];

export function getBlogPost(id: number) {
  return blogPosts.find((p) => p.id === id);
}
