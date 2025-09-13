import { db } from "@/lib/db";
import { usersTable, User, NewUser } from "@/lib/drizzle/schema/users";
import { createId } from "@paralleldrive/cuid2";

export const getAllUsers = async (): Promise<User[]> => {
  const users = await db.select().from(usersTable);
  return users;
};

export const createUser = async (user: NewUser) => {
  const id = createId();
  await db.insert(usersTable).values({
    ...user,
    id: id,
  });

  return { ...user, id };
};