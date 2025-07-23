import { eq } from "drizzle-orm";
import { contactInsert, contactsTable } from "@/lib/drizzle/schema/contacts";
import logger from "@/lib/logger";

export const createContact = async (input: contactInsert, db: any) => {
  await db.insert(contactsTable).values(input);

  // Fetch and return the full inserted row by contact_id
  const [createdContact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, input.id));

  return createdContact;
};

export const getContactById = async (id: string, db: any) => {
  const result = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, id));
  return result[0];
};

export const checkContactExistence = async (phone: string, db: any) => {
  const result = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.phone, phone));
  return result.length > 0 ? true : false;
};

export const updateContactById = async (
  id: string,
  input: contactInsert,
  db: any
) => {
  const [updatedContact] = await db
    .update(contactsTable)
    .set(input)
    .where(eq(contactsTable.id, id));
  const result = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, id));
  logger.info(`Contact with ID ${id} updated successfully.`);
  if (result.length === 0) {
    logger.error(`Contact with ID ${id} not found after update.`);
    throw new Error(`Contact with ID ${id} not found`);
  }
  return result[0];
};

export const getAllContacts = async (db: any) => {
  return await db.select().from(contactsTable);
};
