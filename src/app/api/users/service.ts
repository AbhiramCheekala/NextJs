import * as userModel from "./model";
import { NewUser } from "@/lib/drizzle/schema/users";

export class UserService {
  public async getAllUsers() {
    return await userModel.getAllUsers();
  }

  public async createUser(user: NewUser) {
    return await userModel.createUser(user);
  }
}
