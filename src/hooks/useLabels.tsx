"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type UseLabelProps = {
  search?: string;
};

type Label = {
  id?: string;
  name: string;
};

export function useLabels({ search = "" }: UseLabelProps = {}) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [allContacts, setAllLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/contacts");
      const data = res.data?.data ?? [];

      setAllLabels(data);

      const filtered = data.filter((c: Label) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      setLabels(filtered);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLabel = async (updatedContact: Label) => {
    try {
      await axios.put(`/api/contacts/${updatedContact.id}`, updatedContact);
      await fetchLabels();
    } catch (err) {
      console.error("Failed to save contact:", err);
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      await axios.delete(`/api/contacts/${id}`);
      await fetchLabels();
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };
}
