"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";
import { User } from "@/lib/drizzle/schema/users";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  label: string;
  assignedToUserId?: string;
};

type Meta = {
  totalPages: number;
};

type UseContactsProps = {
  search?: string;
  page?: number;
  limit?: number;
};

export function useContacts({
  search = "",
  page = 1,
  limit = 10,
}: UseContactsProps = {}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<Meta | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const url = `/api/contacts?search=${search}&page=${page}&limit=${limit}`;
      const res = await apiRequest(url, "GET");
      const { data, meta } = res;

      setAllContacts(data);
      setContacts(data);
      setMeta(meta);
    } catch (err) {
      logger.error("Failed to fetch contacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContact = async (updatedContact: Contact) => {
    try {
      await apiRequest(`/contacts/${updatedContact.id}`, "PUT", updatedContact);
      await fetchContacts();
    } catch (err) {
      logger.error("Failed to save contact:", err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await apiRequest(`/contacts/${id}`, "DELETE");
      await fetchContacts();
    } catch (err) {
      logger.error("Failed to delete contact:", err);
    }
  };

  const assignContact = async (contactId: string, userId: string) => {
    try {
      await apiRequest(`/api/contacts/${contactId}/assign`, "POST", {
        userId,
      });
      await fetchContacts();
    } catch (err) {
      logger.error("Failed to assign contact:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, page, limit]);

  return {
    contacts,
    allContacts,
    isLoading,
    refetch: fetchContacts,
    saveContact,
    deleteContact,
    assignContact,
    meta,
  };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("/api/users", "GET");
      setUsers(res.data);
    } catch (err) {
      logger.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading };
}
