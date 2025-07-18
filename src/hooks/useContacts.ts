
'use client';

import type { Contact, ContactTag } from '@/types/contact';
import { useState, useEffect, useCallback } from 'react';

// Mock data - in a real app, this would come from an API
const allMockContacts: Contact[] = [
  { id: "1", name: "Alice Wonderland", phone: "+1-555-0100", email: "alice.wonder@example.com", tags: ["Lead", "Positive", "Engaged"], lastContacted: "2024-07-25", avatar: "https://placehold.co/40x40.png?text=AW", dataAiHint: "woman smiling" },
  { id: "2", name: "Bob The Builder", phone: "+1-555-0101", email: "bob.builder@example.com", tags: ["Converted", "VIP"], lastContacted: "2024-07-20", avatar: "https://placehold.co/40x40.png?text=BB", dataAiHint: "man construction" },
  { id: "3", name: "Charlie Brown", phone: "+1-555-0102", email: "charlie.brown@example.com", tags: ["Neutral", "Follow-up"], lastContacted: "2024-07-22", avatar: "https://placehold.co/40x40.png?text=CB", dataAiHint: "boy cartoon" },
  { id: "4", name: "Diana Prince", phone: "+1-555-0103", email: "diana.prince@example.com", tags: ["Lead", "High-Priority", "Urgent"], lastContacted: "2024-07-28", avatar: "https://placehold.co/40x40.png?text=DP", dataAiHint: "woman hero" },
  { id: "5", name: "Edward Scissorhands", phone: "+1-555-0104", email: "ed.hands@example.com", tags: ["Positive", "Past Customer"], lastContacted: "2024-07-15", avatar: "https://placehold.co/40x40.png?text=ES", dataAiHint: "man pale" },
  { id: "6", name: "Fiona Gallagher", phone: "+1-555-0105", email: "fiona.g@example.com", tags: ["Neutral", "Archived"], lastContacted: "2024-06-01", avatar: "https://placehold.co/40x40.png?text=FG", dataAiHint: "woman thoughtful" },
  { id: "7", name: "George Costanza", phone: "+1-555-0106", email: "george.c@example.com", tags: ["Bad Lead", "Do Not Contact"], lastContacted: "2024-05-10", avatar: "https://placehold.co/40x40.png?text=GC", dataAiHint: "man glasses" },
  { id: "8", name: "Hermione Granger", phone: "+1-555-0107", email: "h.granger@example.com", tags: ["Lead", "Positive", "Engaged", "Potential VIP"], lastContacted: "2024-07-29", avatar: "https://placehold.co/40x40.png?text=HG", dataAiHint: "woman books" },
  { id: "9", name: "Indiana Jones", phone: "+1-555-0108", email: "indy.jones@example.com", tags: ["Past Customer", "Adventurer"], lastContacted: "2023-12-01", avatar: "https://placehold.co/40x40.png?text=IJ", dataAiHint: "man fedora" },
  { id: "10", name: "Jackie Chan", phone: "+1-555-0109", email: "jackie.c@example.com", tags: ["VIP", "Positive", "Influencer"], lastContacted: "2024-07-18", avatar: "https://placehold.co/40x40.png?text=JC", dataAiHint: "man martial" },
  { id: "11", name: "Kara Danvers", phone: "+1-555-0110", email: "kara.d@example.com", tags: ["Lead", "Journalist"], lastContacted: "2024-07-30", avatar: "https://placehold.co/40x40.png?text=KD", dataAiHint: "woman glasses" },
  { id: "12", name: "Luke Skywalker", phone: "+1-555-0111", email: "luke.sky@example.com", tags: ["Past Customer", "Referral"], lastContacted: "2024-03-10", avatar: "https://placehold.co/40x40.png?text=LS", dataAiHint: "man desert" },
  { id: "13", name: "Mary Poppins", phone: "+1-555-0112", email: "m.poppins@example.com", tags: ["Neutral", "Follow-up"], lastContacted: "2024-07-11", avatar: "https://placehold.co/40x40.png?text=MP", dataAiHint: "woman umbrella" },
  { id: "14", name: "Neo Anderson", phone: "+1-555-0113", email: "neo.anderson@example.com", tags: ["Lead", "Tech Savvy"], lastContacted: "2024-07-27", avatar: "https://placehold.co/40x40.png?text=NA", dataAiHint: "man sunglasses" },
  { id: "15", name: "Olivia Benson", phone: "+1-555-0114", email: "olivia.b@example.com", tags: ["VIP", "Loyal Customer"], lastContacted: "2024-07-26", avatar: "https://placehold.co/40x40.png?text=OB", dataAiHint: "woman detective" },
];

interface UseContactsParams {
  search?: string;
  tagFilter?: string; // For filtering by a single tag
}

export function useContacts(params?: UseContactsParams) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a state variable for the master list to make add/delete operations reflect across hook uses.
  // Initialize from allMockContacts only once.
  const [masterContactList, setMasterContactList] = useState<Contact[]>([...allMockContacts]);

  const fetchContacts = useCallback(async (currentParams?: UseContactsParams) => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      let filteredContacts = [...masterContactList]; 
      if (currentParams?.search) {
        const searchTerm = currentParams.search.toLowerCase();
        filteredContacts = filteredContacts.filter(c => 
          c.name.toLowerCase().includes(searchTerm) ||
          (c.email && c.email.toLowerCase().includes(searchTerm)) || 
          c.phone.includes(searchTerm) ||
          c.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      if (currentParams?.tagFilter && currentParams.tagFilter !== 'all') {
        filteredContacts = filteredContacts.filter(c => c.tags.includes(currentParams.tagFilter as ContactTag));
      }
      setContacts(filteredContacts);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [masterContactList]); // Depend on masterContactList

  useEffect(() => {
    fetchContacts(params);
  }, [fetchContacts, params]);

  const saveContact = async (contactToSave: Contact) => {
    setMasterContactList(prevList => {
      const newList = [...prevList];
      const index = newList.findIndex(c => c.id === contactToSave.id);
      if (index > -1) {
        newList[index] = contactToSave;
      } else {
        // Ensure unique ID for new contacts if ID isn't already set (e.g. from form)
        const newId = contactToSave.id || (Math.max(0, ...newList.map(c => parseInt(c.id))) + 1).toString();
        newList.push({ ...contactToSave, id: newId });
      }
      return newList;
    });
    // Refetch will be triggered by masterContactList change in fetchContacts dependency array
  };

  const deleteContact = async (contactId: string) => {
    setMasterContactList(prevList => prevList.filter(c => c.id !== contactId));
    // Refetch will be triggered by masterContactList change
  };


  return { 
    contacts, 
    isLoading, 
    error, 
    refetch: () => fetchContacts(params), 
    allContacts: masterContactList, // This now provides the current state of all contacts
    saveContact, 
    deleteContact 
  };
}
