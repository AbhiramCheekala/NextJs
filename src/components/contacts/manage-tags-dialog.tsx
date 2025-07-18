
'use client';

import { useState, useEffect } from 'react';
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
import { Tags as TagsIcon, X, PlusCircle } from 'lucide-react';
import type { ContactTag } from '@/types/contact';

interface ManageTagsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: (updatedTags: ContactTag[]) => void;
  initialTags?: ContactTag[];
}

const defaultInitialTags: ContactTag[] = ["Lead", "Positive", "Neutral", "Converted", "Bad Lead", "Sales"];

export function ManageTagsDialog({ isOpen, onOpenChange, onSuccess, initialTags }: ManageTagsDialogProps) {
  const [tags, setTags] = useState<ContactTag[]>(initialTags || defaultInitialTags);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTags(initialTags || defaultInitialTags);
      setNewTag('');
    }
  }, [isOpen, initialTags]);

  const handleAddTag = () => {
    if (newTag.trim() !== '' && !tags.some(tag => tag.toLowerCase() === newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: ContactTag) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveChanges = () => {
    // In a real app, you'd likely make an API call here to persist the tags
    onSuccess(tags);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TagsIcon className="mr-2 h-5 w-5" /> Manage Labels/Tags
          </DialogTitle>
          <DialogDescription>
            Add, remove, or view your contact labels. Changes here are for local demo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="new-tag-input">Add New Label</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="new-tag-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g., VIP Customer"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
              />
              <Button type="button" onClick={handleAddTag} size="icon">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Existing Labels</Label>
            {tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center text-sm py-1 px-2">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1.5 h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No labels created yet. Add some above.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
