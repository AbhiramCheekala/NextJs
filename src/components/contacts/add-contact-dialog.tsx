"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Tag as TagIcon, PlusCircle } from "lucide-react";
import type { ContactTag } from "@/types/contact";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/apiClient";
import axios from "axios";

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  existingTags?: ContactTag[];
}

export function AddContactDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  existingTags = [],
}: AddContactDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [selectedTags, setSelectedTags] = useState<ContactTag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setSelectedTags([]);
    setTagInput("");
    setIsTagPopoverOpen(false);
  };

  const handleAddTag = (tagToAdd: ContactTag) => {
    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
      setSelectedTags([...selectedTags, tagToAdd]);
    }
    setTagInput(""); // Clear input after selection or adding
  };

  const handleRemoveTag = (tagToRemove: ContactTag) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        label: selectedTags.join("++"),
      };

      console.log("Sending payload:", payload);

      const res = await axios.post("/api/contacts", payload);

      console.log("Server response:", res.data);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      logger.error("Submit failed:", error);
    }
  };

  const filteredSuggestedTags = existingTags.filter(
    (tag) =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" /> Add New Contact
          </DialogTitle>
          <DialogDescription>
            Enter the details for the new contact. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name-add" className="text-right">
              Name
            </Label>
            <Input
              id="name-add"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone-add" className="text-right">
              Phone
            </Label>
            <Input
              id="phone-add"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
              placeholder="+1234567890"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-add" className="text-right">
              Email
            </Label>
            <Input
              id="email-add"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="name@example.com"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              htmlFor="tags-add-popover-trigger"
              className="text-right pt-2 flex items-center"
            >
              <TagIcon className="h-4 w-4 mr-1" /> Labels
            </Label>
            <div className="col-span-3 space-y-2">
              <Popover
                open={isTagPopoverOpen}
                onOpenChange={setIsTagPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isTagPopoverOpen}
                    className="w-full justify-between"
                    id="tags-add-popover-trigger"
                  >
                    {selectedTags.length > 0
                      ? `${selectedTags.length} selected`
                      : "Add or create labels..."}
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
                        if (
                          e.key === "Enter" &&
                          tagInput.trim() &&
                          !existingTags.includes(tagInput.trim()) &&
                          !selectedTags.includes(tagInput.trim())
                        ) {
                          e.preventDefault();
                          handleAddTag(tagInput.trim());
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {tagInput.trim() &&
                        !existingTags.includes(tagInput.trim()) &&
                        !selectedTags.includes(tagInput.trim()) ? (
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

              <div className="flex flex-wrap gap-1 min-h-[20px]">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center"
                  >
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4 p-0"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Save Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
