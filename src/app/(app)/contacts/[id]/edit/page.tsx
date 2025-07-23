"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function EditContactPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contacts?id=${id}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load contact.");

      const data = json.data;
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        tags: data.tags?.join(", ") || "", // comma-separated
      });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/contacts?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Update failed");

      toast({
        title: "Contact Updated",
        description: `${form.name} was updated successfully.`,
      });

      router.push(`/contacts/${id}`);
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Edit Contact</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="tags">Label(s)</Label>
            <Input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g. topper, colleague"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple labels with commas.
            </p>
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
