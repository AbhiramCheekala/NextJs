"use client";

import useSWR from 'swr';
import useApiClient from './useApiClient';
import { User } from '@/lib/drizzle/schema/users';
import logger from '@/lib/client-logger';

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
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res;
    } catch (err) {
      logger.error("Failed to fetch contacts:", err);
      throw err;
    }
  };

  const url = `/api/contacts?search=${search}&page=${page}&limit=${limit}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: Contact[], meta: Meta }>(
    url,
    fetcher
  );

  const saveContact = async (updatedContact: Contact) => {
    try {
      await apiClient(`/contacts/${updatedContact.id}`, "PUT", updatedContact);
      mutate();
    } catch (err) {
      logger.error("Failed to save contact:", err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await apiClient(`/contacts/${id}`, "DELETE");
      mutate();
    } catch (err) {
      logger.error("Failed to delete contact:", err);
    }
  };

  const assignContact = async (contactId: string, userId: string) => {
    try {
      await apiClient(`/api/contacts/${contactId}/assign`, "POST", {
        userId,
      });
      mutate();
    } catch (err) {
      logger.error("Failed to assign contact:", err);
    }
  };

  return {
    contacts: data?.data || [],
    allContacts: data?.data || [],
    isLoading,
    refetch: mutate,
    saveContact,
    deleteContact,
    assignContact,
    meta: data?.meta,
    error
  };
}

export function useUsers() {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res.data;
    } catch (err) {
      logger.error("Failed to fetch users:", err);
      throw err;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<User[]>(
    '/api/users',
    fetcher
  );

  return { users: data || [], isLoading, error, refetch: mutate };
}