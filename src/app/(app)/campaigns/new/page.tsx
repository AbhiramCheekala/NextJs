"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/apiClient";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { parse } from "csv-parse/browser/esm";

/* =======================
   TYPES
======================= */

type Template = {
  id: number;
  name: string;
  category: string;
  status: string;
  body?: string;
  components?: { text?: string }[];
};

type CsvRow = Record<string, string>;

export default function NewCampaignPage() {
  const { toast } = useToast();
  const router = useRouter();

  /* =======================
     TEMPLATE SEARCH STATE
  ======================= */

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const debouncedSearch = useDebounce(templateSearch, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  /* =======================
     CSV STATE
  ======================= */

  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileKey, setFileKey] = useState(0);

  /* =======================
     CAMPAIGN STATE
  ======================= */

  const [campaignName, setCampaignName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =======================
     FETCH TEMPLATES
  ======================= */

  const fetchTemplates = async (page = 1, search = "") => {
    try {
      setLoadingTemplates(true);

      let url = `/api/templates?page=${page}&limit=6`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await apiRequest(url, "GET");
      setTemplates(res.data || []);
      setMeta(res.meta);
      setCurrentPage(page);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates(1, debouncedSearch);
  }, [debouncedSearch]);

  /* =======================
     TEMPLATE PREVIEW
  ======================= */

  const templatePreview = useMemo(() => {
    if (!selectedTemplate) return null;
    return (
      selectedTemplate.components
        ?.map((c) => c.text)
        .join("\n") || selectedTemplate.body
    );
  }, [selectedTemplate]);

  /* =======================
     CSV UPLOAD
  ======================= */

  const handleFileUpload = (file: File) => {
    setCsvError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      parse(
        reader.result as string,
        { columns: true, trim: true },
        (err, records: CsvRow[]) => {
          if (err) {
            setCsvError("Invalid CSV file");
            return;
          }
          setCsvData(records);
        }
      );
    };
    reader.readAsText(file);
  };

  /* =======================
     SUBMIT
  ======================= */

  const handleSubmit = async () => {
    if (!campaignName || !selectedTemplate || !csvData.length) return;

    setIsSubmitting(true);
    try {
      await apiRequest("/api/campaigns/bulk", "POST", {
        name: campaignName,
        templateId: selectedTemplate.id,
        contacts: csvData,
      });

      toast({
        title: "Campaign Created",
        description: "Campaign created successfully",
      });

      router.push("/campaigns");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      <h1 className="text-3xl font-semibold">New Bulk Campaign</h1>

      {/* CAMPAIGN NAME */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* TEMPLATE SEARCH */}
      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
          <CardDescription>
            Search and select a WhatsApp template
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Search templates..."
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
          />

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-t ${
                      selectedTemplate?.id === t.id
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">{t.category}</td>
                    <td className="px-4 py-2">{t.status}</td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedTemplate(t)}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loadingTemplates && templates.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No templates found
              </div>
            )}
          </div>

          {meta && (
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() =>
                  fetchTemplates(currentPage - 1, debouncedSearch)
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === meta.totalPages}
                onClick={() =>
                  fetchTemplates(currentPage + 1, debouncedSearch)
                }
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TEMPLATE PREVIEW */}
      {templatePreview && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <pre className="whitespace-pre-wrap text-sm">
              {templatePreview}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {/* CSV UPLOAD */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              key={fileKey}
              type="file"
              accept=".csv"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files[0])
              }
            />
            {fileName && (
              <p className="text-sm mt-2 text-muted-foreground">
                {fileName}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          Cancel
        </Button>
        <Button
          disabled={
            !campaignName || !selectedTemplate || !csvData.length || isSubmitting
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? "Creating..." : "Create Campaign"}
        </Button>
      </div>
    </div>
  );
}
