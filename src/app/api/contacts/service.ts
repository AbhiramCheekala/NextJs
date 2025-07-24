import { db } from "@/lib/db";
import * as contactModel from "@/app/api/contacts/model";
import { eq } from "drizzle-orm";
import { contactInsert } from "@/lib/drizzle/schema/contacts";

export const createContact = async (input: contactInsert) => {
  return await contactModel.createContact(input, db);
};

export const getContactById = async (id: string) => {
  return await contactModel.getContactById(id, db);
};

export const checkContactExistence = async (
  phone: string
): Promise<boolean> => {
  return await contactModel.checkContactExistence(phone, db);
};

export const deleteContactById = async (id: string) => {
  return await contactModel.deleteContactById(id, db);
};

export const updateContactById = async (id: string, input: contactInsert) => {
  return await contactModel.updateContactById(id, input, db);
};

export const getAllContacts = async () => {
  return await contactModel.getAllContacts(db);
};
