import { and, eq, inArray, like, sql, or } from "drizzle-orm";
import {
  contactInsert,
  contactSelect,
  contactsTable,
} from "@/lib/drizzle/schema/contacts";
import logger from "@/lib/logger";
import { db } from "@/lib/db";
import { User } from "@/lib/drizzle/schema/users";

export const createContact = async (
  input: contactInsert
): Promise<contactSelect> => {
  const result: any = await db.insert(contactsTable).values(input);

  // MySQL gives insertId for autoincrement PK
  const id = result.insertId;

  const [createdContact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.id, id));

  if (!createdContact) {
    throw new Error("Failed to fetch created contact after insert");
  }

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

  const exists = result.length > 0;
  logger.info(`Contact existence check for phone ${phone}: ${exists}`);
  return exists;
};

export const updateContactById = async (
  id: string,
  updates: Partial<contactInsert>
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
  const result: any = await db
    .delete(contactsTable)
    .where(eq(contactsTable.id, id));

  if (result.affectedRows === 0) {
    throw new Error(`No contact found with ID: ${id}`);
  }

  logger.info(`Contact deleted successfully: ${id}`);
};

export const getAllContacts = async (
  options: {
    page: number;
    limit: number;
    search: string;
  },
  user: User
): Promise<{ contacts: contactSelect[]; total: number }> => {
  const { page, limit, search } = options;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(contactsTable.name, `%${search}%`),
        like(contactsTable.phone, `%${search}%`)
      )
    );
  }

  if (user.role === "member") {
    conditions.push(eq(contactsTable.assignedToUserId, user.id));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [contacts, totalResult] = await Promise.all([
    db
      .select()
      .from(contactsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset),
    db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(contactsTable)
      .where(whereClause),
  ]);

  logger.info(`Total contacts retrieved: ${contacts.length}`);
  return { contacts, total: totalResult[0].count };
};

export const createBulkContacts = async (
  contacts: contactInsert[]
): Promise<contactSelect[]> => {
  await db.insert(contactsTable).values(contacts);

  // Re-fetch by phone numbers (assuming phone is unique per contact)
  const phones = contacts.map((c) => c.phone);

  const createdContacts = await db
    .select()
    .from(contactsTable)
    .where(inArray(contactsTable.phone, phones));

  logger.info(`${createdContacts.length} contacts created successfully`);
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

export const assignContact = async (
  contactId: string,
  userId: string
): Promise<void> => {
  await updateContactById(contactId, { assignedToUserId: userId });
};
