
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useContacts } from '@/hooks/useContacts';
import type { Contact, ContactTag } from '@/types/contact';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Tag as TagIcon, X, Save, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;
  const { toast } = useToast();

  const { allContacts: masterContactList, saveContact, deleteContact: hookDeleteContact, isLoading: isLoadingMasterList } = useContacts();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [selectedTags, setSelectedTags] = useState<ContactTag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);

  const allAvailableTags = Array.from(new Set(masterContactList.flatMap(c => c.tags))).sort();

  useEffect(() => {
    if (contactId && masterContactList.length > 0) {
      setIsFetchingDetails(true);
      const foundContact = masterContactList.find(c => c.id === contactId);
      if (foundContact) {
        setContact(foundContact);
        setFormData(foundContact);
        setSelectedTags(foundContact.tags || []);
      } else {
        // Contact not found, maybe redirect or show error
        toast({ title: "Error", description: "Contact not found.", variant: "destructive" });
        router.push('/contacts');
      }
      setIsFetchingDetails(false);
    } else if (!isLoadingMasterList && masterContactList.length === 0 && contactId) {
      // Master list is loaded but empty, contact cannot exist
      setIsFetchingDetails(false);
      toast({ title: "Error", description: "Contact list empty.", variant: "destructive" });
      router.push('/contacts');
    }
  }, [contactId, masterContactList, router, toast, isLoadingMasterList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTag = (tagToAdd: ContactTag) => {
    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
      setSelectedTags([...selectedTags, tagToAdd]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: ContactTag) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveChanges = async () => {
    if (!contact) return;
    const updatedContactData = { ...formData, id: contact.id, tags: selectedTags } as Contact;
    // Simulate API call
    await saveContact(updatedContactData); // from useContacts hook
    toast({ title: "Contact Updated", description: `${updatedContactData.name}'s details have been saved.` });
    router.push('/contacts'); // Or just refetch data if staying on page
  };

  const handleDelete = async () => {
    if (!contact) return;
    // Simulate API call
    await hookDeleteContact(contact.id); // from useContacts hook
    toast({ title: "Contact Deleted", description: `${contact.name} has been deleted.`, variant: "destructive" });
    router.push('/contacts');
  };

  if (isLoadingMasterList || isFetchingDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 items-center gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-9 col-span-3" />
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!contact) {
     // This case should ideally be handled by the useEffect redirecting, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Contact not found or error loading details.</p>
        <Button onClick={() => router.push('/contacts')} className="mt-4">Back to Contacts</Button>
      </div>
    );
  }
  
  const filteredSuggestedTags = allAvailableTags.filter(
    (tag) => !selectedTags.includes(tag) && tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/contacts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-headline font-semibold flex items-center">
          <User className="mr-3 h-7 w-7 text-primary" /> Edit Contact: {contact.name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Update the contact's information and labels below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name-edit">Full Name</Label>
              <Input id="name-edit" name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1"/>
            </div>
            <div>
              <Label htmlFor="phone-edit">Phone Number</Label>
              <Input id="phone-edit" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1"/>
            </div>
            <div>
              <Label htmlFor="email-edit">Email Address</Label>
              <Input id="email-edit" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="mt-1"/>
            </div>
             <div>
              <Label htmlFor="lastContacted-edit">Last Contacted</Label>
              <Input id="lastContacted-edit" name="lastContacted" type="date" value={formData.lastContacted || ''} onChange={handleInputChange} className="mt-1"/>
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags-edit-popover-trigger" className="flex items-center mb-1">
              <TagIcon className="h-4 w-4 mr-1 text-muted-foreground" /> Labels
            </Label>
            <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={isTagPopoverOpen} className="w-full justify-between" id="tags-edit-popover-trigger">
                  {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Add or create labels..."}
                  <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Type to search or create..."
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim() && !allAvailableTags.includes(tagInput.trim()) && !selectedTags.includes(tagInput.trim())) {
                        e.preventDefault();
                        handleAddTag(tagInput.trim());
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {tagInput.trim() && !allAvailableTags.includes(tagInput.trim()) && !selectedTags.includes(tagInput.trim()) ? (
                        <CommandItem
                          onSelect={() => handleAddTag(tagInput.trim())}
                          className="cursor-pointer"
                        >
                          Create "{tagInput.trim()}"
                        </CommandItem>
                      ) : (
                        "No labels found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredSuggestedTags.map((tag) => (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={() => handleAddTag(tag)}
                          className="cursor-pointer"
                        >
                          {tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="mt-2 flex flex-wrap gap-1 min-h-[20px]">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center">
                  {tag}
                  <Button variant="ghost" size="icon" className="ml-1 h-4 w-4 p-0" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button variant="outline" onClick={() => router.push('/contacts')}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete Contact</Button>
          <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
