"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { FilePlus2 } from "lucide-react";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function CreateTemplateDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [form, setForm] = useState({
    name: "",
    category: "UTILITY",
    language: "en_US",
    body: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok || result?.error) {
        throw new Error(result?.error?.message || "Submission failed.");
      }

      onSuccess(); // Notify parent to refresh or refetch
      onOpenChange(false); // Close dialog
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FilePlus2 className="mr-2 h-5 w-5" />
            Create New WhatsApp Template
          </DialogTitle>
          <DialogDescription>
            Enter the required details and submit the template to WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Template Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border rounded p-2 text-sm"
          >
            <option value="UTILITY">UTILITY</option>
            <option value="MARKETING">MARKETING</option>
            <option value="TRANSACTIONAL">TRANSACTIONAL</option>
          </select>

          <Input
            placeholder="Language (e.g. en_US)"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          />

          <Textarea
            placeholder="Body (e.g., Hi {{1}}, your OTP is {{2}}.)"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
