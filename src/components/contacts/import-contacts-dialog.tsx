"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud, Tag as TagIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { read, utils } from "xlsx";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ImportContactsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function ImportContactsDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: ImportContactsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tagsToApply, setTagsToApply] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setTagsToApply("");
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          toast({
            title: "Invalid File",
            description: "No contact data found in the file.",
            variant: "destructive",
          });
          return;
        }

        const contactsToImport = json.slice(1).map((row: any) => ({
          phone: `${row[0]}${row[1]}`,
          name: row[2],
          email: `${row[0]}${row[1]}@example.com`,
        }));

        const parsedTags = tagsToApply
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");

        // Bulk request using axios
        await axios.post("/api/contacts/bulk", {
          contacts: contactsToImport,
          // tags: parsedTags,
        });

        toast({
          title: "Import Successful",
          description: `${contactsToImport.length} contacts have been imported.`,
        });
        onSuccess();
        onOpenChange(false);
        resetDialog();
      } catch (error) {
        logger.error("Error importing contacts:", error);
        toast({
          title: "Import Failed",
          description: "An error occurred while importing contacts.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetDialog();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UploadCloud className="mr-2 h-5 w-5" /> Import Contacts
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or XLSX file. Optionally, add tags to apply to all
            imported contacts.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                {file ? (
                  <p className="text-sm text-foreground font-semibold">
                    {file.name}
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSV or XLSX (MAX. 5MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div>
            <Label htmlFor="import-tags" className="flex items-center mb-1">
              <TagIcon className="h-4 w-4 mr-1 text-muted-foreground" />
              Apply Tags (optional)
            </Label>
            <Input
              id="import-tags"
              value={tagsToApply}
              onChange={(e) => setTagsToApply(e.target.value)}
              placeholder="e.g., new_leads, event_attendees"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter comma-separated tags to apply to all imported contacts.
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            File preview and column mapping functionalities will be implemented
            here.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetDialog();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleImport} disabled={!file}>
            Import Contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
