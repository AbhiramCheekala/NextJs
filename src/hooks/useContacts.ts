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

export function useContacts({ search = "" }: UseContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:9002/api/contacts");
      const data = res.data?.data ?? [];

      setAllContacts(data);

      // Apply optional search filter
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

  useEffect(() => {
    fetchContacts();
  }, [search]);

  return { contacts, allContacts, isLoading, refetch: fetchContacts };
}
