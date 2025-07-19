import { db } from "@/lib/db";
import { contactInsert, contactsTable } from "@/lib/drizzle/schema/contacts";
import { eq } from "drizzle-orm";

export const createContact = async (input: contactInsert) => {
  return await db.insert(contactsTable).values(input);
};

export const getContactById = async (id: string) => {
  const result = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, id));
  return result[0];
};

export const updateContactById = async (id: string, input: contactInsert) => {
  return await db
    .update(contactsTable)
    .set(input)
    .where(eq(contactsTable.id, id));
};

export const getAllContacts = async () => {
  return await db.select().from(contactsTable);
};
