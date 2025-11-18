"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, RefreshCcw, Eye, RefreshCw } from "lucide-react";
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
import logger from "@/lib/client-logger";
import { CreateTemplateDialog } from "@/components/templates/create-template-dialog";
import { useToast } from "@/hooks/use-toast";
import type { VariantProps } from "class-variance-authority";
import { apiRequest } from "@/lib/apiClient";

type Template = {
  id: string;
  name: string;
  category: string;
  status: string;
  updatedAt: string;
  lastUpdated: string;
};

type Meta = {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
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
  const [meta, setMeta] = useState<Meta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  const fetchTemplates = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiRequest(`/api/templates?page=${page}&limit=6`, "GET");
      const { data, meta } = res;
      setTemplates(data || []);
      setMeta(meta);
      setCurrentPage(page);
    } catch (err) {
      logger.error("Failed to load templates", err);
      toast({
        title: "Error",
        description: "Could not load templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(currentPage);
  }, [currentPage]);

  const handleCreateTemplateSuccess = () => {
    toast({
      title: "Template Draft Saved",
      description: "Your new template draft has been saved (dummy action).",
    });
    fetchTemplates(1); // refresh the list and go to the first page
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

  const handleSync = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/templates/sync", "GET");
      toast({
        title: "Sync Complete",
        description: `${data.syncedCount} new templates were synced from Meta.`,
      });
      fetchTemplates(1); // Refresh the list and go to the first page
    } catch (err) {
      logger.error("Failed to sync templates", err);
      toast({
        title: "Sync Failed",
        description: "An error occurred while syncing templates from Meta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (templateName: string) => {
    toast({
      title: "Edit Template",
      description: `Opening editor for ${templateName}. (Not implemented)`,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && meta && newPage <= meta.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-3.5rem-2rem)] sm:h-[calc(100vh-3.5rem)]">
      <CreateTemplateDialog
        isOpen={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
        onSuccess={handleCreateTemplateSuccess}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">
          Message Templates
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Sync with Meta
          </Button>
          <Button onClick={() => setIsCreateTemplateOpen(true)}>
            <FilePlus2 className="mr-2 h-4 w-4" /> Create New Template
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Template Management</CardTitle>
          <CardDescription>
            Build, submit to Meta, poll status, and preview your WhatsApp
            message templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="overflow-x-auto">
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {meta && `Showing ${templates.length} of ${meta.total} templates.`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!meta || currentPage === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}