import { eq, inArray, like, sql } from "drizzle-orm";
import {
  contactInsert,
  contactSelect,
  contactsTable,
} from "@/lib/drizzle/schema/contacts";
import logger from "@/lib/logger";
import { db } from "@/lib/db";

export const createContact = async (
  input: contactInsert
): Promise<contactSelect> => {
  const [createdContact] = await db
    .insert(contactsTable)
    .values(input)
    .returning();

  logger.info(`Contact created successfully: ${createdContact.id}`);
  return createdContact;
};

export const getContactById = async (
  id: string
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
  phone: string
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
  updates: contactInsert
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

export const deleteContactById = async (id: string): Promise<void> => {
  const result = await db.delete(contactsTable).where(eq(contactsTable.id, id));

  if (result.numDeletedRows === 0) {
    throw new Error(`No contact found with ID: ${id}`);
  }

  logger.info(`Contact deleted successfully: ${id}`);
};

export const getAllContacts = async (options: {
  page: number;
  limit: number;
  search: string;
}): Promise<{ contacts: contactSelect[]; total: number }> => {
  const { page, limit, search } = options;
  const offset = (page - 1) * limit;

  const where = search
    ? like(contactsTable.name, `%${search}%`)
    : undefined;

  const [contacts, totalResult] = await Promise.all([
    db
      .select()
      .from(contactsTable)
      .where(where)
      .limit(limit)
      .offset(offset),
    db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(contactsTable)
      .where(where),
  ]);

  logger.info(`Total contacts retrieved: ${contacts.length}`);
  return { contacts, total: totalResult[0].count };
};

export const createBulkContacts = async (
  contacts: contactInsert[]
): Promise<contactSelect[]> => {
  const createdContacts = await db
    .insert(contactsTable)
    .values(contacts)
    .returning();

  logger.info(`${contacts.length} contacts created successfully`);
  return createdContacts;
};

export const getContactsByIds = async (
  ids: string[]
): Promise<contactSelect[]> => {
  const contacts = await db
    .select()
    .from(contactsTable)
    .where(inArray(contactsTable.id, ids));
  return contacts;
};

export const getContactByPhone = async (
  phone: string
): Promise<contactSelect | null> => {
  const [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.phone, phone));

  if (!contact) {
    return null;
  }
  return contact;
};
