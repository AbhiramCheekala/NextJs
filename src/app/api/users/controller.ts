import { db } from "@/lib/db";
import { usersTable } from "@/lib/drizzle/schema/users";
import { eq } from "drizzle-orm";
import { User } from "@/lib/drizzle/schema/users";
import { createUser } from "@/app/api/users/service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

// Replace with your actual secret key (store it in env)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function loginUser(body: { email: string; password: string }) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, body.email));

  if (!user || !user.password) {
    return { status: "error", message: "Invalid email or password" };
  }

  // Validate password
  // const isPasswordValid = await bcrypt.compare(body.password, user.password);
  if (user.password !== body.password) {
    return { status: "error", message: "Invalid email or password" };
  }

  // Set new login time
  const loginTime = new Date();

  // Update lastLoginAt in DB
  await db
    .update(usersTable)
    .set({ lastLoginAt: loginTime })
    .where(eq(usersTable.id, user.id));

  // Remove password from returned user
  const { password, ...userWithoutPassword } = user;

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    status: "success",
    message: "Login successful",
    user: {
      ...userWithoutPassword,
      lastLoginAt: loginTime,
    },
    token,
  };
}
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
