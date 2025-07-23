import { eq } from "drizzle-orm";
import {
  contactInsert,
  contactSelect,
  contactsTable,
} from "@/lib/drizzle/schema/contacts";
import logger from "@/lib/logger";

export const createContact = async (
  input: contactInsert,
  db: any
): Promise<contactSelect> => {
  await db.insert(contactsTable).values(input);

  const [createdContact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, input.id));

  logger.info(`Contact created successfully: ${input.id}`);
  return createdContact;
};

export const getContactById = async (
  id: string,
  db: any
): Promise<contactSelect | null> => {
  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, id));

  if (!contact) {
    logger.warn(`No contact found for ID: ${id}`);
    return null;
  }
  return contact;
};

export const checkContactExistence = async (
  phone: string,
  db: any
): Promise<boolean> => {
  const result = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.phone, phone));

  const exists = result.length > 0 ? true : false;
  logger.info(`Contact existence check for phone ${phone}: ${exists}`);
  return exists;
};

export const updateContactById = async (
  id: string,
  updates: contactInsert,
  db: any
): Promise<contactSelect> => {
  logger.info(`Updating contact with ID: ${id}`);

  await db.update(contactsTable).set(updates).where(eq(contactsTable.id, id));

  const [updatedContact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, id));

  if (!updatedContact) {
    logger.error(`Contact with ID ${id} not found after update.`);
    throw new Error(`Contact with ID ${id} not found`);
  }

  logger.info(`Contact updated successfully: ${id}`);
  return updatedContact;
};

export const getAllContacts = async (db: any): Promise<contactSelect> => {
  logger.info("Fetching all contacts");
  const contacts = await db.select().from(contactsTable);
  logger.info(`Total contacts retrieved: ${contacts.length}`);
  return contacts;
};
