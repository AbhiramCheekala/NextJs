"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, RefreshCcw, Eye } from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { CreateTemplateDialog } from "@/components/templates/create-template-dialog";
import { useToast } from "@/hooks/use-toast";
import type { VariantProps } from "class-variance-authority";

type Template = {
  id: string;
  name: string;
  category: string;
  status: string;
  updatedAt: string;
  lastUpdated: string;
};

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
};

export default function TemplatesPage() {
  const { toast } = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplateSuccess = () => {
    toast({
      title: "Template Draft Saved",
      description: "Your new template draft has been saved (dummy action).",
    });
    fetchTemplates(); // refresh the list
  };

  const handlePreview = (templateName: string) => {
    toast({
      title: "Preview Template",
      description: `Showing preview for ${templateName}. (Not implemented)`,
    });
  };

  const handlePollStatus = (templateName: string) => {
    toast({
      title: "Poll Status",
      description: `Polling status for ${templateName}. (Not implemented)`,
    });
  };

  const handleEdit = (templateName: string) => {
    toast({
      title: "Edit Template",
      description: `Opening editor for ${templateName}. (Not implemented)`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <CreateTemplateDialog
        isOpen={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
        onSuccess={handleCreateTemplateSuccess}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">
          Message Templates
        </h1>
        <Button onClick={() => setIsCreateTemplateOpen(true)}>
          <FilePlus2 className="mr-2 h-4 w-4" /> Create New Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Management</CardTitle>
          <CardDescription>
            Build, submit to Meta, poll status, and preview your WhatsApp
            message templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-mono text-xs">
                    {template.id}
                  </TableCell>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(template.status)}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Preview"
                      onClick={() => handlePreview(template.name)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Poll Status"
                      disabled={template.status !== "PENDING"}
                      onClick={() => handlePollStatus(template.name)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleEdit(template.name)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-center text-muted-foreground mt-6">
            Template builder, submission to Meta, status polling, and preview
            functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
