import { db } from "@/lib/db";
import { usersTable, User, NewUser } from "@/lib/drizzle/schema/users";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export const getAllUsers = async (): Promise<User[]> => {
  const users = await db.select().from(usersTable);
  return users;
};

export const createUser = async (user: NewUser) => {
  await db.insert(usersTable).values(user);

  return user;
};

export const updateUserPassword = async (
  userId: string,
  hashedPassword: string
) => {
  const result = await db
    .update(usersTable)
    .set({ password: hashedPassword })
    .where(eq(usersTable.id, userId));

  if ((result as any).affectedRows === 0) {
    return { status: "error", message: "User not found" };
  }

  return { status: "success", message: "Password updated successfully" };
};

export const updateUser = async (
  userId: string,
  userData: { name?: string; email?: string; role?: "admin" | "member" }
) => {
  const result = await db
    .update(usersTable)
    .set(userData)
    .where(eq(usersTable.id, userId));

  if ((result as any).affectedRows === 0) {
    return { status: "error", message: "User not found" };
  }

  return { status: "success", message: "User updated successfully" };
};

export const deleteUser = async (userId: string) => {
  const result = await db.delete(usersTable).where(eq(usersTable.id, userId));

  if ((result as any).affectedRows === 0) {
    return { status: "error", message: "User not found" };
  }

  return { status: "success", message: "User deleted successfully" };
};
