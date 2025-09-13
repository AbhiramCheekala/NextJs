import * as contactModel from "@/app/api/contacts/model";
import { contactInsert } from "@/lib/drizzle/schema/contacts";

export class ContactService {
  public async createContact(input: contactInsert) {
    return await contactModel.createContact(input);
  }

  public async getContactById(id: string) {
    return await contactModel.getContactById(id);
  }

  public async checkContactExistence(phone: string): Promise<boolean> {
    return await contactModel.checkContactExistence(phone);
  }

  public async deleteContactById(id: string) {
    return await contactModel.deleteContactById(id);
  }

  public async updateContactById(id: string, input: contactInsert) {
    return await contactModel.updateContactById(id, input);
  }

  public async getAllContacts(
    options: {
      page: number;
      limit: number;
      search: string;
    },
    user: any
  ) {
    return await contactModel.getAllContacts(options, user);
  }

  public async createBulkContacts(contacts: contactInsert[]) {
    return await contactModel.createBulkContacts(contacts);
  }

  public async assignContact(contactId: string, userId: string) {
    return await contactModel.assignContact(contactId, userId);
  }
}