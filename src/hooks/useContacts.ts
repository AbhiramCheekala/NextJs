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
};

export function useContacts({ search = "" }: UseContactsProps = {}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:9002/api/contacts");
      const data = res.data?.data ?? [];

      setAllContacts(data);

      const filtered = data.filter((c: Contact) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      setContacts(filtered);
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
      await fetchContacts(); // Refresh after saving
    } catch (err) {
      console.error("Failed to save contact:", err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await axios.delete(`http://localhost:9002/api/contacts/${id}`);
      await fetchContacts(); // Refresh after deletion
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search]);

  return {
    contacts,
    allContacts,
    isLoading,
    refetch: fetchContacts,
    saveContact,
    deleteContact,
  };
}
