"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/apiClient";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle, Tag as TagIcon } from "lucide-react";

export default function EditContactPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState(""); // raw label from API
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]); // Could be fetched if needed
  const [loading, setLoading] = useState(false);

  // Parse label into tags
  useEffect(() => {
    if (label) {
      setSelectedTags(label.split("++").filter(Boolean));
    }
  }, [label]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const json = await apiRequest(`/api/contacts?id=${id}`, "GET");
      const contact = json.data;

      setName(contact.name || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setLabel(contact.label || "");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      router.push("/contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchContact();
  }, [id]);

  const handleSave = async () => {
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        label: selectedTags.join("++"),
      };

      await apiRequest(`/api/contacts?id=${id}`, "PUT", payload);

      toast({
        title: "Contact Updated",
        description: `${name} was updated successfully.`,
      });

      router.push(`/contacts/${id}`);
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const filteredSuggestedTags = existingTags.filter(
    (tag) =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Edit Contact</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1">
              <TagIcon className="h-4 w-4" /> Labels
            </Label>
            <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  role="combobox"
                >
                  {selectedTags.length > 0
                    ? `${selectedTags.length} selected`
                    : "Add or create labels..."}
                  <PlusCircle className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Type to search or create..."
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        tagInput.trim() &&
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
                        >
                          {tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-1 mt-2">
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
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
