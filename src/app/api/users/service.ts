import { db } from "@/lib/db";
import { usersTable } from "@/lib/drizzle/schema/users";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export async function updateLastLogin(userId: string) {
  await db
    .update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function createUser({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const id = createId();
  await db.insert(usersTable).values({
    id: id,
    name,
    email,
    password, // store hashed!
    role,
  });

  return { id, name, email, role };
}
