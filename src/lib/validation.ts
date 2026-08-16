import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Parses and validates a request body against a zod schema. Returns either
 * the typed data or a ready-to-return 400 NextResponse describing the first
 * validation failure.
 */
export async function parseJson<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T>; error?: undefined } | { data?: undefined; error: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request body";
    return { error: NextResponse.json({ error: message }, { status: 400 }) };
  }
  return { data: result.data };
}

export const orderSchema = z.object({
  orderNumber: z.string().trim().min(1).max(64).optional(),
  couponCode: z.string().trim().max(40).nullable().optional(),
  paymentMethod: z.enum(["credit", "cod", "applepay", "paypal"]).default("credit"),
  customer: z.object({
    firstName: z.string().trim().min(1, "First name is required").max(80),
    lastName: z.string().trim().min(1, "Last name is required").max(80),
    email: z.string().trim().email("Enter a valid email").max(160),
    phone: z.string().trim().min(1, "Phone is required").max(40),
    country: z.string().trim().min(1, "Country is required").max(80),
    town: z.string().trim().min(1, "Town is required").max(120),
    street: z.string().trim().min(1, "Street is required").max(200),
    postal: z.string().trim().max(20).optional().default(""),
    note: z.string().trim().max(1000).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        size: z.string().trim().max(20).optional(),
        color: z.string().trim().max(40).optional(),
        quantity: z.number().int().positive().max(50),
      })
    )
    .min(1, "Cart is empty")
    .max(100),
});

export const adminAuthSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(200),
});

export const accountAuthSchema = z.object({
  action: z.enum(["signup", "signin"]),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const reviewCreateSchema = z.object({
  author: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1, "Review body is required").max(1000),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  nameAr: z.string().trim().max(200).optional(),
  category: z.string().trim().min(1, "Category is required").max(100),
  categoryAr: z.string().trim().max(100).optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional().default(0),
  status: z.enum(["active", "draft"]).optional().default("active"),
  description: z.string().trim().max(5000).optional().default(""),
  descriptionAr: z.string().trim().max(5000).optional().default(""),
  images: z.array(z.string()).optional().default([]),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional().default([]),
  sizes: z.array(z.string()).optional().default([]),
});

export const productUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  nameAr: z.string().trim().max(200).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  categoryAr: z.string().trim().max(100).optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  status: z.enum(["active", "draft"]).optional(),
  description: z.string().trim().max(5000).optional(),
  descriptionAr: z.string().trim().max(5000).optional(),
  images: z.array(z.string()).optional(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
  sizes: z.array(z.string()).optional(),
  discount: z.number().min(0).max(100).optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
});

export const customerUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
}).strict();

// Danger Zone bulk operations. `operation` is a closed enum — the frontend
// can never send an arbitrary model name or SQL. `password` is only required
// (and only checked) for reset_store.
export const databaseOperationSchema = z.object({
  operation: z.enum(["delete_products", "delete_categories", "reset_store"]),
  confirmation: z.string().max(60),
  password: z.string().max(200).optional(),
}).strict();

export const couponCreateSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(40),
  type: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  value: z.number().nonnegative().optional().default(10),
  active: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().nullable().optional(),
});
