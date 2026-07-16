import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/customer-auth";

const INITIAL_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@modave.com").trim().toLowerCase();
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/**
 * Authenticates the only dashboard administrator. On a fresh database, the
 * first successful login with the initial .env credentials creates that admin
 * record. Later logins always verify the password hash stored in the database.
 */
export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let admin = await db.admin.findUnique({ where: { email: normalizedEmail } });

  if (!admin) {
    if (normalizedEmail !== INITIAL_ADMIN_EMAIL || password !== INITIAL_ADMIN_PASSWORD) return null;

    try {
      admin = await db.admin.create({
        data: {
          name: "Store Admin",
          email: normalizedEmail,
          passwordHash: hashPassword(password),
        },
      });
    } catch {
      // A simultaneous first login may have created the singleton record.
      admin = await db.admin.findUnique({ where: { email: normalizedEmail } });
      if (!admin) return null;
    }
  }

  if (!verifyPassword(password, admin.passwordHash)) return null;

  await db.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return admin;
}
