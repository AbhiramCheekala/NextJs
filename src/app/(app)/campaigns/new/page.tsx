"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/useTemplates";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { apiRequest } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { parse } from "csv-parse/browser/esm";

interface TemplateComponent {
  text: string;
}

interface Template {
  id: number;
  name: string;
  components: TemplateComponent[];
}

/* ===========================
   ✅ CSV HOOK (csv-parse)
=========================== */

export function useCampaignCsvData() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, requiredHeaders: string[]) => {
    try {
      const text = await file.text();

      parse(
        text,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err, records) => {
          if (err) {
            setCsvError("Failed to parse CSV");
            return;
          }

          if (!records || records.length === 0) {
            setCsvError("CSV is empty.");
            return;
          }

          const headers = Object.keys(records[0] || {}).map((h) =>
            h.trim()
          );

          const missing = requiredHeaders.filter(
            (h) => !headers.includes(h)
          );

          if (missing.length > 0) {
            const msg = `Missing required headers: ${missing.join(", ")}`;

            setCsvError(msg);
            setCsvHeaders([]);
            setCsvData([]);
            return;
          }

          setCsvHeaders(headers);
          setCsvData(records);
          setCsvError(null);

        }
      );
    } catch (e) {

      setCsvError("Failed to read CSV file.");
    }
  };

  return {
    csvData,
    csvHeaders,
    csvError,
    handleFileUpload,
  };
}

/* ===========================
   ✅ MAIN COMPONENT
=========================== */

export default function NewCampaignPage() {
  const [templateSearch, setTemplateSearch] = useState("");
  const debouncedSearch = useDebounce(templateSearch, 400);

  const { templates, isLoading: isLoadingTemplates } =
    useTemplates(debouncedSearch);

  const { toast } = useToast();
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] =
    useState<string | null>(null);

  const [selectedTemplateObject, setSelectedTemplateObject] =
    useState<Template | null>(null);

  const [campaignName, setCampaignName] = useState("");

  const { csvData, csvHeaders, csvError, handleFileUpload } =
    useCampaignCsvData();

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);

    const template = templates.find(
      (t: Template) => t.id.toString() === templateId
    );

    setSelectedTemplateObject(template || null);
  };

  /* ✅ Extract {{variables}} from template */
  const templateVariables = useMemo(() => {
    if (!selectedTemplateObject?.components) return [];

    const variables = new Set<string>();

    selectedTemplateObject.components.forEach(
      (component: TemplateComponent) => {
        if (component.text) {
          const matches = component.text.match(/{{(.*?)}}/g);
          if (matches) {
            matches.forEach((match: string) =>
              variables.add(
                match.replace(/{{|}}/g, "").trim()
              )
            );
          }
        }
      }
    );

    return Array.from(variables);
  }, [selectedTemplateObject]);

  useEffect(() => {
    if (csvError) {
      console.error("❌ CSV Error:", csvError);
    }
  }, [csvError]);

  const handleSubmit = async () => {
    if (!campaignName || !selectedTemplate || csvData.length === 0) {
      toast({
        title: "Error",
        description:
          "Please fill in all fields and upload a CSV.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("/api/campaigns/bulk", "POST", {
        name: campaignName,
        templateId: selectedTemplate,
        contacts: csvData,
      });

      toast({
        title: "Campaign Created",
        description: "Messages will be sent shortly.",
      });

      router.push("/campaigns");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    }
  };

  const templateOptions = templates.map((template: Template) => ({
    value: template.id.toString(),
    label: template.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">New Bulk Campaign</h1>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Select a template and upload a CSV.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Campaign Name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />

          <Combobox
            options={templateOptions}
            value={selectedTemplate || ""}
            onChange={handleTemplateChange}
            placeholder="Select a template"
            searchPlaceholder="Search templates..."
            emptyText={
              isLoadingTemplates
                ? "Loading..."
                : "No templates found."
            }
            onSearchChange={setTemplateSearch}
          />

          {selectedTemplate && (
            <div>
              <label
                htmlFor="csv-upload"
                className="text-sm font-medium"
              >
                Upload Contacts (CSV)
              </label>

              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const requiredHeaders = [
                    "name",
                    "whatsappnumber",
                    ...templateVariables,
                  ];

                  handleFileUpload(file, requiredHeaders);
                }}
                className="mt-1"
              />

              {templateVariables.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Required columns:{" "}
                  <strong>
                    name, whatsappnumber,{" "}
                    {templateVariables.join(", ")}
                  </strong>
                </p>
              )}

              {csvError && (
                <p className="text-sm text-red-500 mt-2">
                  {csvError}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Contacts</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvHeaders.map((header) => (
                      <TableHead key={header}>
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {csvData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {csvHeaders.map((header) => (
                        <TableCell key={header}>
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedTemplate || csvData.length === 0}
      >
        Create Campaign
      </Button>
    </div>
  );
}
