"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  label: string;
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
  const [meta, setMeta] = useState(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:9002/api/contacts", {
        params: {
          search,
          page,
          limit,
        },
      });
      const { data, meta } = res.data;

      setAllContacts(data);
      setContacts(data);
      setMeta(meta);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContact = async (updatedContact: Contact) => {
    try {
      await axios.put(
        `http://localhost:9002/api/contacts/${updatedContact.id}`,
        updatedContact
      );
      await fetchContacts();
    } catch (err) {
      console.error("Failed to save contact:", err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await axios.delete(`http://localhost:9002/api/contacts/${id}`);
      await fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact:", err);
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
    meta,
  };
}
