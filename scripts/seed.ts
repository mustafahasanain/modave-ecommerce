import { db } from "../src/lib/db";
import { blogPosts } from "../src/data/blog";
import { products } from "../src/data/products";
import { DEFAULT_HOME_CONFIG } from "../src/lib/home-config";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number, hour = 12) {
  const date = new Date(Date.now() - days * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * DAY_MS);
}

async function seedProducts() {
  console.log("Seeding products...");
  for (const product of products) {
    const data = {
      name: product.name,
      nameAr: product.nameAr,
      category: product.category,
      categoryAr: product.categoryAr,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      discount: product.discount ?? null,
      rating: product.rating,
      reviews: product.reviews,
      sold: product.sold,
      images: JSON.stringify(product.images),
      colors: JSON.stringify(product.colors),
      sizes: JSON.stringify(product.sizes),
      description: product.description,
      descriptionAr: product.descriptionAr,
      badge: product.badge ?? null,
      vendor: product.vendor,
      sku: product.sku,
      stock: product.stock,
      featured: product.featured ?? false,
      bestSeller: product.bestSeller ?? false,
      newArrival: product.newArrival ?? false,
      status: product.status ?? "active",
    };

    await db.product.upsert({
      where: { id: product.id },
      update: data,
      create: { id: product.id, ...data },
    });
  }
  console.log(`  ✓ ${products.length} products`);
}

async function seedCategories() {
  console.log("Seeding categories...");
  const categories = [
    { id: 1, name: "Women's", nameAr: "نساء", slug: "women", image: products[2].images[0] },
    { id: 2, name: "Men's", nameAr: "رجال", slug: "men", image: products[1].images[0] },
    { id: 3, name: "Dresses", nameAr: "فساتين", slug: "dresses", image: products[6].images[0] },
    { id: 4, name: "Outerwear", nameAr: "ملابس خارجية", slug: "outerwear", image: products[4].images[0] },
    { id: 5, name: "Knitwear", nameAr: "ملابس محبوكة", slug: "knitwear", image: products[8].images[0] },
    { id: 6, name: "Bags", nameAr: "حقائب", slug: "bags", image: products[10].images[0] },
    { id: 7, name: "Shoes", nameAr: "أحذية", slug: "shoes", image: products[12].images[0] },
    { id: 8, name: "Accessories", nameAr: "إكسسوارات", slug: "accessories", image: products[14].images[0] },
  ];

  for (const category of categories) {
    const itemCount = products.filter((product) => product.category === category.name).length;
    await db.category.upsert({
      where: { id: category.id },
      update: { ...category, itemCount, active: true },
      create: { ...category, itemCount, active: true },
    });
  }
  console.log(`  ✓ ${categories.length} categories`);
}

const demoCustomers = [
  { name: "سارة محمد", email: "sara.mohammed@example.com", phone: "+964 770 123 4101", tier: "VIP", notes: "تفضّل المقاسات الواسعة والتوصيل المسائي.", joinedAt: daysAgo(150) },
  { name: "علي حسين", email: "ali.hussein@example.com", phone: "+964 781 234 5202", tier: "Regular", notes: "عميل متكرر من بغداد.", joinedAt: daysAgo(95) },
  { name: "نور كريم", email: "noor.kareem@example.com", phone: "+964 750 345 6303", tier: "VIP", notes: "مهتمة بوصولات الحقائب والإكسسوارات الجديدة.", joinedAt: daysAgo(72) },
  { name: "زينب أحمد", email: "zainab.ahmed@example.com", phone: "+964 770 456 7404", tier: "Regular", notes: null, joinedAt: daysAgo(44) },
  { name: "مصطفى علي", email: "mustafa.ali@example.com", phone: "+964 780 567 8505", tier: "New", notes: "أول طلب تم عبر الدفع عند الاستلام.", joinedAt: daysAgo(23) },
  { name: "رهف سامر", email: "rahaf.samer@example.com", phone: "+964 751 678 9606", tier: "Regular", notes: null, joinedAt: daysAgo(18) },
  { name: "حيدر قاسم", email: "haider.qasim@example.com", phone: "+964 773 789 1707", tier: "New", notes: null, joinedAt: daysAgo(11) },
  { name: "مريم فاضل", email: "maryam.fadhil@example.com", phone: "+964 782 890 2808", tier: "New", notes: "تفضّل التواصل عبر الهاتف قبل التوصيل.", joinedAt: daysAgo(5) },
  { name: "أحمد رائد", email: "ahmed.raid@example.com", phone: "+964 750 901 3909", tier: "New", notes: null, joinedAt: daysAgo(2) },
  { name: "لارا جلال", email: "lara.jalal@example.com", phone: "+964 751 012 4010", tier: "New", notes: null, joinedAt: daysAgo(1) },
];

async function seedCustomers() {
  console.log("Seeding customers...");
  const ids = new Map<string, string>();
  for (const customer of demoCustomers) {
    const saved = await db.customer.upsert({
      where: { email: customer.email },
      update: {
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes,
        joinedAt: customer.joinedAt,
      },
      create: {
        ...customer,
        orders: 0,
        totalSpent: 0,
      },
    });
    ids.set(customer.email, saved.id);
  }
  console.log(`  ✓ ${demoCustomers.length} customers`);
  return ids;
}

type DemoOrder = {
  orderNumber: string;
  customerEmail: string;
  country: string;
  town: string;
  street: string;
  postal?: string;
  note?: string;
  productId: number;
  quantity: number;
  size: string;
  color: string;
  discount?: number;
  shipping?: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
};

async function seedOrders(customerIds: Map<string, string>) {
  console.log("Seeding orders...");
  const demoOrders: DemoOrder[] = [
    { orderNumber: "MDV-260801", customerEmail: "sara.mohammed@example.com", country: "Iraq", town: "Baghdad", street: "Al-Mansour, 14 Ramadan St.", productId: 5, quantity: 1, size: "M", color: "Beige", discount: 22, paymentMethod: "credit", status: "paid", createdAt: daysAgo(3, 18) },
    { orderNumber: "MDV-260802", customerEmail: "ali.hussein@example.com", country: "Iraq", town: "Baghdad", street: "Al-Karrada, District 903", productId: 2, quantity: 2, size: "L", color: "White", paymentMethod: "cod", status: "paid", createdAt: daysAgo(6, 14) },
    { orderNumber: "MDV-260803", customerEmail: "noor.kareem@example.com", country: "Iraq", town: "Erbil", street: "Ankawa, 100m Road", productId: 11, quantity: 1, size: "One Size", color: "Brown", discount: 14, paymentMethod: "credit", status: "paid", createdAt: daysAgo(9, 20) },
    { orderNumber: "MDV-260804", customerEmail: "zainab.ahmed@example.com", country: "Iraq", town: "Najaf", street: "Al-Amir District", productId: 7, quantity: 1, size: "S", color: "Rust", paymentMethod: "cod", status: "pending", createdAt: daysAgo(12, 11) },
    { orderNumber: "MDV-260805", customerEmail: "mustafa.ali@example.com", country: "Iraq", town: "Basra", street: "Al-Jumhuriya St.", productId: 1, quantity: 2, size: "XL", color: "Black", paymentMethod: "cod", status: "paid", createdAt: daysAgo(15, 16) },
    { orderNumber: "MDV-260806", customerEmail: "rahaf.samer@example.com", country: "Iraq", town: "Baghdad", street: "Al-Yarmouk, Four Streets", productId: 3, quantity: 1, size: "M", color: "Cream", paymentMethod: "credit", status: "paid", createdAt: daysAgo(19, 19) },
    { orderNumber: "MDV-260807", customerEmail: "haider.qasim@example.com", country: "Iraq", town: "Mosul", street: "Al-Majmoua Al-Thaqafiya", productId: 10, quantity: 1, size: "L", color: "Navy", shipping: 5, paymentMethod: "cod", status: "cancelled", createdAt: daysAgo(22, 9) },
    { orderNumber: "MDV-260808", customerEmail: "maryam.fadhil@example.com", country: "Iraq", town: "Baghdad", street: "Zayouna, Spring St.", productId: 15, quantity: 2, size: "One Size", color: "Gold", discount: 10, paymentMethod: "credit", status: "paid", createdAt: daysAgo(26, 17) },
    { orderNumber: "MDV-260809", customerEmail: "sara.mohammed@example.com", country: "Iraq", town: "Baghdad", street: "Al-Mansour, 14 Ramadan St.", productId: 13, quantity: 1, size: "38", color: "Black", paymentMethod: "credit", status: "paid", createdAt: daysAgo(34, 18) },
    { orderNumber: "MDV-260810", customerEmail: "ali.hussein@example.com", country: "Iraq", town: "Baghdad", street: "Al-Karrada, District 903", productId: 14, quantity: 1, size: "42", color: "White", discount: 10, paymentMethod: "cod", status: "paid", createdAt: daysAgo(39, 13) },
    { orderNumber: "MDV-260811", customerEmail: "noor.kareem@example.com", country: "Iraq", town: "Erbil", street: "Ankawa, 100m Road", productId: 16, quantity: 1, size: "One Size", color: "Brown", paymentMethod: "credit", status: "paid", createdAt: daysAgo(47, 21) },
    { orderNumber: "MDV-260812", customerEmail: "zainab.ahmed@example.com", country: "Iraq", town: "Najaf", street: "Al-Amir District", productId: 9, quantity: 1, size: "M", color: "Cream", paymentMethod: "cod", status: "pending", createdAt: daysAgo(55, 10) },
    { orderNumber: "MDV-260813", customerEmail: "sara.mohammed@example.com", country: "Iraq", town: "Baghdad", street: "Al-Mansour, 14 Ramadan St.", productId: 7, quantity: 1, size: "M", color: "Black", discount: 13, paymentMethod: "credit", status: "paid", createdAt: daysAgo(78, 17) },
    { orderNumber: "MDV-260814", customerEmail: "noor.kareem@example.com", country: "Iraq", town: "Erbil", street: "Ankawa, 100m Road", productId: 12, quantity: 1, size: "One Size", color: "Black", paymentMethod: "credit", status: "paid", createdAt: daysAgo(112, 20) },
  ];

  for (const order of demoOrders) {
    const customer = demoCustomers.find((item) => item.email === order.customerEmail)!;
    const product = products.find((item) => item.id === order.productId)!;
    const subtotal = product.price * order.quantity;
    const discount = order.discount ?? 0;
    const shipping = order.shipping ?? 0;
    const total = Math.round((subtotal - discount + shipping) * 100) / 100;
    const data = {
      customerId: customerIds.get(order.customerEmail),
      customerName: customer.name,
      customerEmail: order.customerEmail,
      customerPhone: customer.phone,
      country: order.country,
      town: order.town,
      street: order.street,
      postal: order.postal ?? null,
      note: order.note ?? null,
      items: JSON.stringify([{
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: order.size,
        color: order.color,
        quantity: order.quantity,
      }]),
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      estimatedDelivery: new Date(order.createdAt.getTime() + 6 * DAY_MS),
      createdAt: order.createdAt,
    };

    await db.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: data,
      create: { orderNumber: order.orderNumber, ...data },
    });
  }

  for (const customer of demoCustomers) {
    const customerId = customerIds.get(customer.email)!;
    const orders = await db.order.findMany({
      where: { customerId, status: { not: "cancelled" } },
      select: { total: true },
    });
    const totalSpent = Math.round(orders.reduce((sum, order) => sum + order.total, 0) * 100) / 100;
    const tier = totalSpent >= 500 ? "VIP" : orders.length >= 2 ? "Regular" : "New";
    await db.customer.update({
      where: { id: customerId },
      data: { orders: orders.length, totalSpent, tier },
    });
  }
  console.log(`  ✓ ${demoOrders.length} orders with linked customer totals`);
}

async function seedReviews() {
  console.log("Seeding reviews...");
  const reviews = [
    { id: "demo-review-001", productId: 5, author: "سارة محمد", email: "sara.mohammed@example.com", rating: 5, title: "خامة ممتازة", body: "المعطف أنيق ودافئ والمقاس مضبوط تماماً. التغليف همين كلش مرتب.", verified: true, status: "approved", createdAt: daysAgo(2) },
    { id: "demo-review-002", productId: 3, author: "رهف سامر", email: "rahaf.samer@example.com", rating: 5, title: "أجمل من الصور", body: "لون الساتان راقٍ والقصة مريحة. وصل الطلب بسرعة ومن دون أي ملاحظات.", verified: true, status: "approved", createdAt: daysAgo(7) },
    { id: "demo-review-003", productId: 11, author: "نور كريم", email: "noor.kareem@example.com", rating: 4, title: "حقيبة عملية", body: "الحجم مناسب للدوام والجيوب الداخلية مفيدة جداً. أتمنى تتوفر بألوان أكثر.", verified: true, status: "approved", createdAt: daysAgo(10) },
    { id: "demo-review-004", productId: 1, author: "مصطفى علي", email: "mustafa.ali@example.com", rating: 5, title: "قطن مريح", body: "الخامة ناعمة وما تغيّر القياس بعد الغسل. راح أطلب لون ثاني.", verified: true, status: "approved", createdAt: daysAgo(14) },
    { id: "demo-review-005", productId: 15, author: "مريم فاضل", email: "maryam.fadhil@example.com", rating: 5, title: "تفصيل جميل", body: "خفيفة على الأذن وشكلها مميز، مناسبة كهدية أيضاً.", verified: true, status: "approved", createdAt: daysAgo(20) },
    { id: "demo-review-006", productId: 7, author: "زينب أحمد", email: "zainab.ahmed@example.com", rating: 4, title: "فستان أنيق", body: "القصة حلوة جداً لكن الطول كان أطول شوي من المتوقع.", verified: true, status: "approved", createdAt: daysAgo(25) },
    { id: "demo-review-007", productId: 9, author: "هدى سالم", email: "huda.salem@example.com", rating: 5, title: "بانتظار الموافقة", body: "كارديغان ناعم ولونه مطابق للصور، مناسب جداً للمساء.", verified: false, status: "pending", createdAt: daysAgo(1) },
    { id: "demo-review-008", productId: 14, author: "أحمد رائد", email: "ahmed.raid@example.com", rating: 4, title: "مريح للمشي", body: "جربته يوم كامل وكان مريح، أنصح باختيار القياس المعتاد.", verified: false, status: "pending", createdAt: daysAgo(0) },
  ];

  for (const review of reviews) {
    await db.review.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    });
  }
  console.log(`  ✓ ${reviews.length} reviews`);
}

async function seedBlog() {
  console.log("Seeding blog posts...");
  for (const post of blogPosts) {
    const data = {
      title: post.title,
      titleAr: post.titleAr,
      excerpt: post.excerpt,
      excerptAr: post.excerptAr,
      content: post.content ?? "",
      contentAr: post.contentAr ?? "",
      category: post.category,
      categoryAr: post.categoryAr,
      author: post.author,
      authorAr: post.authorAr,
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      featured: post.featured ?? false,
      status: "published",
    };
    await db.blogPost.upsert({
      where: { id: post.id },
      update: data,
      create: { id: post.id, ...data },
    });
  }
  console.log(`  ✓ ${blogPosts.length} blog posts`);
}

async function seedStorefrontContent() {
  console.log("Seeding storefront content...");
  const heroSlides = [
    {
      id: 101,
      image: "/banners/modave-elegance-1.jpg",
      eyebrow: "New Season · 2026",
      eyebrowAr: "الموسم الجديد · 2026",
      title: "Everyday elegance, thoughtfully made",
      titleAr: "أناقة يومية مصممة بعناية",
      subtitle: "Discover refined essentials and statement pieces for every occasion.",
      subtitleAr: "اكتشفي أساسيات راقية وقطعاً مميزة لكل مناسبة.",
      cta: "Shop New Arrivals",
      ctaAr: "تسوّق الجديد",
      href: "/shop",
      order: 10,
      active: true,
    },
    {
      id: 102,
      image: "/banners/modave-elegance-2.jpg",
      eyebrow: "The Modave Edit",
      eyebrowAr: "اختيارات موديف",
      title: "Pieces you will wear on repeat",
      titleAr: "قطع سترتدينها مراراً",
      subtitle: "Timeless silhouettes, modern details, and fabrics chosen to last.",
      subtitleAr: "قصات خالدة وتفاصيل عصرية وخامات مختارة لتدوم.",
      cta: "Explore Collection",
      ctaAr: "استكشف المجموعة",
      href: "/collections",
      order: 11,
      active: true,
    },
  ];
  for (const slide of heroSlides) {
    await db.heroSlide.upsert({ where: { id: slide.id }, update: slide, create: slide });
  }

  const testimonials = [
    { id: 1, text: "الخامة والتفصيل أفضل من المتوقع، والطلب وصلني مرتب وبالوقت المحدد.", name: "سارة محمد", role: "عميلة موثقة", product: products[4].nameAr, price: `$${products[4].price}`, avatar: products[4].images[0], order: 1, active: true },
    { id: 2, text: "أحببت سهولة الطلب وتنوع الخيارات. الحقيبة صارت القطعة المفضلة عندي للدوام.", name: "نور كريم", role: "عميلة موثقة", product: products[10].nameAr, price: `$${products[10].price}`, avatar: products[10].images[0], order: 2, active: true },
    { id: 3, text: "المقاس دقيق والقطن مريح جداً. تجربة ممتازة وأكيد راح أطلب مرة ثانية.", name: "مصطفى علي", role: "عميل موثق", product: products[0].nameAr, price: `$${products[0].price}`, avatar: products[0].images[0], order: 3, active: true },
    { id: 4, text: "التغليف أنيق وخدمة العملاء سريعة. الفستان مناسب تماماً للمناسبة.", name: "زينب أحمد", role: "عميلة موثقة", product: products[6].nameAr, price: `$${products[6].price}`, avatar: products[6].images[0], order: 4, active: true },
  ];
  for (const testimonial of testimonials) {
    await db.testimonial.upsert({ where: { id: testimonial.id }, update: testimonial, create: testimonial });
  }

  const shippingOptions = [
    { id: 1, label: "Baghdad delivery (1–2 days)", labelAr: "توصيل بغداد (1–2 يوم)", price: 5, active: true },
    { id: 2, label: "Other governorates (2–4 days)", labelAr: "باقي المحافظات (2–4 أيام)", price: 7, active: true },
    { id: 3, label: "Free delivery over $70", labelAr: "توصيل مجاني للطلبات فوق $70", price: 0, active: true },
  ];
  for (const option of shippingOptions) {
    await db.shippingOption.upsert({ where: { id: option.id }, update: option, create: option });
  }

  const coupons = [
    { code: "WELCOME10", type: "percentage", value: 10, active: true, expiresAt: daysFromNow(120) },
    { code: "MODAVE20", type: "fixed", value: 20, active: true, expiresAt: daysFromNow(60) },
    { code: "VIP15", type: "percentage", value: 15, active: true, expiresAt: daysFromNow(90) },
  ];
  for (const coupon of coupons) {
    await db.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  const homeConfig = {
    ...DEFAULT_HOME_CONFIG,
    collections: [1, 2, 3, 4, 6],
    testimonials: [1, 2, 3, 4],
  };
  const settings: Record<string, string> = {
    logoText: "Modave",
    phone: "+964 770 000 2026",
    email: "hello@modave.example",
    address: "Al-Mansour, Baghdad, Iraq",
    announcement1: "FREE DELIVERY ON ORDERS OVER $70",
    announcement1Ar: "توصيل مجاني للطلبات فوق $70",
    announcement2: "EASY RETURNS WITHIN 14 DAYS",
    announcement2Ar: "إرجاع سهل خلال 14 يوماً",
    instagramHandle: "@modave.iq",
    freeShipThreshold: "70",
    cartCountdownMinutes: "15",
    discountThreshold: "200",
    discountPercentage: "10",
    maxDiscount: "80",
    countdownHours: "48",
    homeConfig: JSON.stringify(homeConfig),
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log(`  ✓ ${heroSlides.length} hero slides, ${testimonials.length} testimonials, ${shippingOptions.length} shipping options, ${coupons.length} coupons`);
}

async function main() {
  console.log("\nCreating Modave demo data...\n");
  await seedProducts();
  await seedCategories();
  const customerIds = await seedCustomers();
  await seedOrders(customerIds);
  await seedReviews();
  await seedBlog();
  await seedStorefrontContent();
  console.log("\nDemo data is ready.\n");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
