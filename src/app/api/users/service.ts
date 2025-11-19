import * as userModel from "./model";
import { NewUser } from "@/lib/drizzle/schema/users";

export class UserService {
  public async getAllUsers() {
    return await userModel.getAllUsers();
  }

  public async createUser(user: NewUser) {
    return await userModel.createUser(user);
  }

  public async updateUserPassword(userId: string, hashedPassword: string) {
    return await userModel.updateUserPassword(userId, hashedPassword);
  }

  public async updateUser(
    userId: string,
    userData: { name?: string; email?: string; role?: "admin" | "member" }
  ) {
    return await userModel.updateUser(userId, userData);
  }

  public async deleteUser(userId: string) {
    return await userModel.deleteUser(userId);
  }
}
