import { db } from "../src/lib/db";
import { products } from "../src/data/products";

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await db.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        nameAr: p.nameAr,
        category: p.category,
        categoryAr: p.categoryAr,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        discount: p.discount ?? null,
        rating: p.rating,
        reviews: p.reviews,
        sold: p.sold,
        images: JSON.stringify(p.images),
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        description: p.description,
        descriptionAr: p.descriptionAr,
        badge: p.badge ?? null,
        vendor: p.vendor,
        sku: p.sku,
        stock: p.stock,
        featured: p.featured ?? false,
        bestSeller: p.bestSeller ?? false,
        newArrival: p.newArrival ?? false,
        status: "active",
      },
      create: {
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        category: p.category,
        categoryAr: p.categoryAr,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        discount: p.discount ?? null,
        rating: p.rating,
        reviews: p.reviews,
        sold: p.sold,
        images: JSON.stringify(p.images),
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        description: p.description,
        descriptionAr: p.descriptionAr,
        badge: p.badge ?? null,
        vendor: p.vendor,
        sku: p.sku,
        stock: p.stock,
        featured: p.featured ?? false,
        bestSeller: p.bestSeller ?? false,
        newArrival: p.newArrival ?? false,
        status: "active",
      },
    });
    console.log(`  ✓ Product ${p.id}: ${p.name}`);
  }

  // Seed a few sample orders
  console.log("Seeding sample orders...");
  const sampleOrders = [
    {
      orderNumber: "MDV-100001",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@example.com",
      customerPhone: "+1 555 0101",
      country: "United States",
      town: "New York",
      street: "123 5th Ave",
      postal: "10001",
      items: JSON.stringify([{ id: 1, name: "V-neck cotton T-shirt", price: 59.99, quantity: 2 }]),
      subtotal: 119.98,
      discount: 0,
      shipping: 0,
      total: 119.98,
      paymentMethod: "credit",
      status: "paid",
    },
    {
      orderNumber: "MDV-100002",
      customerName: "Mark Chen",
      customerEmail: "mark@example.com",
      customerPhone: "+1 555 0102",
      country: "United States",
      town: "San Francisco",
      street: "456 Market St",
      postal: "94103",
      items: JSON.stringify([{ id: 5, name: "Belted Manteco coat", price: 219.99, quantity: 1 }]),
      subtotal: 219.99,
      discount: 22,
      shipping: 0,
      total: 197.99,
      paymentMethod: "paypal",
      status: "pending",
    },
    {
      orderNumber: "MDV-100003",
      customerName: "Elena Rossi",
      customerEmail: "elena@example.com",
      customerPhone: "+39 02 1234",
      country: "Italy",
      town: "Milan",
      street: "Via Roma 10",
      postal: "20121",
      items: JSON.stringify([{ id: 7, name: "Belt wrap dress", price: 159.99, quantity: 1 }]),
      subtotal: 159.99,
      discount: 0,
      shipping: 0,
      total: 159.99,
      paymentMethod: "credit",
      status: "paid",
    },
  ];
  for (const o of sampleOrders) {
    await db.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: o,
      create: o,
    });
  }
  console.log(`  ✓ ${sampleOrders.length} orders seeded`);

  // Seed sample customers
  console.log("Seeding sample customers...");
  const sampleCustomers = [
    { name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 555 0101", orders: 4, totalSpent: 487.95, tier: "VIP" },
    { name: "Mark Chen", email: "mark@example.com", phone: "+1 555 0102", orders: 2, totalSpent: 359.98, tier: "Regular" },
    { name: "Elena Rossi", email: "elena@example.com", phone: "+39 02 1234", orders: 3, totalSpent: 529.97, tier: "VIP" },
    { name: "James Smith", email: "james@example.com", orders: 1, totalSpent: 89.99, tier: "New" },
    { name: "Aisha Rahman", email: "aisha@example.com", orders: 5, totalSpent: 712.45, tier: "VIP" },
  ];
  for (const c of sampleCustomers) {
    await db.customer.upsert({
      where: { email: c.email },
      update: c,
      create: c,
    });
  }
  console.log(`  ✓ ${sampleCustomers.length} customers seeded`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
