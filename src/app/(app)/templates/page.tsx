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
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchTemplates = async (page = 1, search = "") => {
    setLoading(true);
    try {
      let url = `/api/templates?page=${page}&limit=6`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await apiRequest(url, "GET");
      const { data, meta } = res;
      setTemplates(data || []);
      setMeta(meta);
      setCurrentPage(page); // Keep track of the page we are on
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

  // Effect for search term changes
  useEffect(() => {
    // When search term changes, always fetch page 1
    fetchTemplates(1, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleCreateTemplateSuccess = () => {
    toast({
      title: "Template Draft Saved",
      description: "Your new template draft has been saved (dummy action).",
    });
    fetchTemplates(1, debouncedSearchTerm); // refresh the list
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await apiRequest("/api/templates/sync", "POST");
      toast({
        title: "Sync Started",
        description:
          "Successfully initiated sync with Meta. Templates will be updated shortly.",
      });
      // It might take a moment for the sync to complete.
      // We can optionally add a delay or a more sophisticated polling mechanism.
      setTimeout(() => fetchTemplates(1, debouncedSearchTerm), 2000);
    } catch (error) {
      logger.error("Failed to sync templates with Meta", error);
      toast({
        title: "Sync Failed",
        description: "Could not sync templates with Meta. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePollStatus = async (templateName: string) => {
    try {
      const res = await apiRequest(
        `/api/templates/poll?name=${encodeURIComponent(templateName)}`,
        "POST"
      );
      toast({
        title: "Status Polled",
        description: `Template "${templateName}" status is now ${res.data.status}.`,
      });
      fetchTemplates(currentPage, debouncedSearchTerm); // refresh current page
    } catch (error) {
      logger.error(`Failed to poll status for ${templateName}`, error);
      toast({
        title: "Polling Failed",
        description: `Could not poll status for "${templateName}".`,
        variant: "destructive",
      });
    }
  };

  const handlePreview = (templateName: string) => {
    // This would ideally open a dialog with the template preview
    toast({
      title: `TODO: Preview ${templateName}`,
      description: "This functionality has not been implemented yet.",
    });
  };

  const handleEdit = (templateName: string) => {
    // This would ideally navigate to an edit page or open a dialog
    toast({
      title: `TODO: Edit ${templateName}`,
      description: "This functionality has not been implemented yet.",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && meta && newPage <= meta.totalPages) {
      // When paginating, we don't want to trigger the search effect,
      // so we call fetchTemplates directly.
      fetchTemplates(newPage, debouncedSearchTerm);
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
          <div className="pt-4">
            <Input
              placeholder="Search templates by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
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