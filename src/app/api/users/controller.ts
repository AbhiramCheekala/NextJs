import { db } from "@/lib/db";
import { usersTable } from "@/lib/drizzle/schema/users";
import { eq } from "drizzle-orm";
import { User } from "@/lib/drizzle/schema/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "./service";
import { requireAdmin } from "./auth"; // Import requireAdmin
import { validatePassword } from "@/lib/utils"; // Assuming utils.ts for helper functions
import { createId } from "@paralleldrive/cuid2"; // Import createId

const userService = new UserService();

// Helper function to validate password
// This function can be placed in a utils file if desired
/*
const validatePassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
*/

export async function getAllUsers(req: NextRequest) {
  // Only admins should be able to get all users
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;

  const users = await userService.getAllUsers();
  return NextResponse.json({ data: users });
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
  const isPasswordValid = await bcrypt.compare(body.password, user.password);
  // await bcrypt.compare(body.password, user.password);
  if (!isPasswordValid) {
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
  role?: "admin" | "member";
}) {
  const { name, email, password, role } = body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

  const id = createId(); // Generate a unique ID
  await userService.createUser({
    id,
    name,
    email,
    password: hashedPassword,
    role, // Accept "admin" | "member" | undefined
  });

  return { status: "success", message: "User created successfully" };
}

export async function createUser(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { name, email, password, role, confirmPassword } = body;

    if (!name || !email || !password || !role || !confirmPassword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Password format validation: Min 8 characters, at least one uppercase, one lowercase, one number, one special character
    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    const result = await createUserController({ name, email, password, role });

    if (result.status === "error") {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function updatePasswordInController(
  userId: string,
  newPassword: string
) {
  // Password format validation: Min 8 characters, at least one uppercase, one lowercase, one number, one special character
  if (!validatePassword(newPassword)) {
    return {
      status: "error",
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await userService.updateUserPassword(userId, hashedPassword);

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  return { status: "success", message: "User password updated successfully" };
}

export async function updateUserPasswordController(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const body = await req.json();
    const { userId, newPassword, confirmPassword } = body;

    if (!userId || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          message:
            "Missing required fields (userId, newPassword, confirmPassword)",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    const result = await updatePasswordInController(userId, newPassword);

    if (result.status === "error") {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "User password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user password:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function updateUserController(
  userId: string,
  body: { name: string; email: string; role?: "admin" | "member" }
) {
  const { name, email, role } = body;

  if (!name || !email || !role) {
    return { status: "error", message: "Missing required fields" };
  }

  const result = await userService.updateUser(userId, { name, email, role });

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  return { status: "success", message: "User updated successfully" };
}

export async function updateUser(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const { userId } = params;
    const body = await req.json();
    const { name, email, role } = body;

    const result = await updateUserController(userId, { name, email, role });

    if (result.status === "error") {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function deleteUser(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;

  try {
    const { userId } = params;

    const result = await userService.deleteUser(userId);

    if (result.status === "error") {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
