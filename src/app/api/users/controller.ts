import { db } from "@/lib/db";
import { usersTable } from "@/lib/drizzle/schema/users";
import { eq } from "drizzle-orm";
import { User } from "@/lib/drizzle/schema/users";
import { createUser } from "@/app/api/users/service";

export async function getAllUsers(): Promise<User[]> {
  return await db.select().from(usersTable);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return result[0];
}

export async function loginUser(
  email: string,
  password: string
): Promise<User | null> {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const user = result[0];
  if (!user) return null;

  // You should hash and verify passwords securely
  if (user.password !== password) return null;

  // Update last login
  await db
    .update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(usersTable.id, user.id));

  return user;
}

import bcrypt from "bcryptjs";

export async function createUserController(body: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const { name, email, password = "hello", role } = body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

  await createUser({ name, email, password: hashedPassword, role });

  return { status: "success", message: "User created successfully" };
}
