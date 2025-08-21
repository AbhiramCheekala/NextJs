"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  UploadCloud,
  SheetIcon,
  Tags as TagsIcon,
  MoreHorizontal,
  Edit3,
  Trash2,
  Filter,
} from "lucide-react";
import { AddContactDialog } from "@/components/contacts/add-contact-dialog";
import { ImportContactsDialog } from "@/components/contacts/import-contacts-dialog";
import { ManageTagsDialog } from "@/components/contacts/manage-tags-dialog"; // New Dialog
import { useToast } from "@/hooks/use-toast";
import { useContacts } from "@/hooks/useContacts";
import type { Contact, ContactTag } from "@/types/contact";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

// Helper to get a consistent color for tags, can be expanded
const getTagColor = (tagName: ContactTag) => {
  const lowerTagName = tagName.toLowerCase();
  if (lowerTagName.includes("lead")) return "bg-blue-500 hover:bg-blue-600";
  if (lowerTagName.includes("positive"))
    return "bg-green-500 hover:bg-green-600";
  if (lowerTagName.includes("neutral")) return "bg-gray-500 hover:bg-gray-600";
  if (lowerTagName.includes("converted"))
    return "bg-purple-500 hover:bg-purple-600";
  if (lowerTagName.includes("bad") || lowerTagName.includes("negative"))
    return "bg-red-500 hover:bg-red-600";
  return "bg-primary hover:bg-primary/90"; // Default
};

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { contacts, isLoading, refetch, allContacts, meta } = useContacts({
    search: searchTerm,
    page,
    limit: 6,
  });
  const router = useRouter();

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isImportContactsOpen, setIsImportContactsOpen] = useState(false);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddContactSuccess = () => {
    toast({
      title: "Contact Added",
      description: "The new contact has been saved.",
    });
    refetch();
  };

  const handleImportContactsSuccess = () => {
    toast({
      title: "Import Started",
      description: "Contacts are being imported in the background.",
    });
    refetch();
  };

  const handleImportGoogleSheets = () => {
    toast({
      title: "Coming Soon!",
      description:
        "Importing contacts from Google Sheets will be available soon.",
    });
  };

  const handleManageTagsSuccess = (newTags: string[]) => {
    // In a real app, you might refetch contacts if tags influence display or filtering globally
    toast({
      title: "Tags Updated",
      description: "Your tags have been managed.",
    });
    console.log("Updated tags:", newTags); // Placeholder
  };

  const handleDeleteContact = (contactName: string) => {
    toast({
      title: "Contact Deleted",
      description: `${contactName} has been (mock) deleted.`,
      variant: "destructive",
    });
    // Call actual delete function from useContacts hook and refetch
  };

  const allAvailableTags = Array.from(
    new Set(allContacts.flatMap((c) => c.label?.split("++") || []))
  ).sort();

  return (
    <div className="flex flex-col gap-6">
      <AddContactDialog
        isOpen={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
        onSuccess={handleAddContactSuccess}
        existingTags={allAvailableTags}
      />
      <ImportContactsDialog
        isOpen={isImportContactsOpen}
        onOpenChange={setIsImportContactsOpen}
        onSuccess={handleImportContactsSuccess}
      />
      <ManageTagsDialog
        isOpen={isManageTagsOpen}
        onOpenChange={setIsManageTagsOpen}
        onSuccess={handleManageTagsSuccess}
        initialTags={allAvailableTags} // Pass current unique tags
      />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Contacts</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddContactOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <UploadCloud className="mr-2 h-4 w-4" /> Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsImportContactsOpen(true)}>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Excel/CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportGoogleSheets}>
                <SheetIcon className="mr-2 h-4 w-4" /> Import from Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => setIsManageTagsOpen(true)}>
            <TagsIcon className="mr-2 h-4 w-4" /> Manage Labels
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex-1">
              <CardTitle>Contact List</CardTitle>
              <CardDescription>
                View, search, and manage your contacts.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search contacts..."
                className="max-w-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="icon" disabled>
                <Filter className="h-4 w-4" />
              </Button>{" "}
              {/* Placeholder for filter button */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Last Interaction</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : contacts.length > 0
                ? contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {contact.name}
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.label
                            ?.split("++")
                            .filter(Boolean)
                            .map((label: string) => (
                              <Badge
                                key={label}
                                className={`text-white ${getTagColor(label)}`}
                              >
                                {label}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/contacts/${contact.id}`)
                              }
                            >
                              <Edit3 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteContact(contact.name)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                : <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No contacts found.
                    </TableCell>
                  </TableRow>}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === meta?.totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
