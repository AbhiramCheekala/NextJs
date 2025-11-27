"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Upload, FileText, AlertCircle } from "lucide-react";
import { parse } from "csv-parse/browser/esm";

/* =========================
   TYPES
========================= */

type TemplateFromApi = {
  id: number;
  name: string;
  body?: string;
  components?: { text?: string }[];
};

type CsvRow = Record<string, string>;

type ValidationResult = {
  isValid: boolean;
  error: string | null;
  warnings: string[];
};

export default function NewCampaignPage() {
  const [templateSearch, setTemplateSearch] = useState("");
  const debouncedSearch = useDebounce(templateSearch, 400);
  const { templates, isLoading } = useTemplates(debouncedSearch);
  const { toast } = useToast();
  const router = useRouter();

  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFromApi | null>(null);

  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvWarnings, setCsvWarnings] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  /* =========================
     TEMPLATE VARIABLE EXTRACTION
  ========================= */

  const templateVariables = useMemo(() => {
    if (!selectedTemplate) return [];

    const vars = new Set<string>();
    const regex = /\{\{(\d+)\}\}/g;

    // Extract from components
    if (selectedTemplate.components?.length) {
      selectedTemplate.components.forEach((c) => {
        if (!c.text) return;
        let match;
        while ((match = regex.exec(c.text)) !== null) {
          vars.add(match[1]);
        }
      });
    }

    // Extract from body
    if (selectedTemplate.body) {
      let match;
      const bodyRegex = /\{\{(\d+)\}\}/g;
      while ((match = bodyRegex.exec(selectedTemplate.body)) !== null) {
        vars.add(match[1]);
      }
    }

    return Array.from(vars).sort((a, b) => parseInt(a) - parseInt(b));
  }, [selectedTemplate]);

  /* =========================
     TEMPLATE PREVIEW
  ========================= */

  const templatePreview = useMemo(() => {
    if (!selectedTemplate) return null;

    let text = "";
    if (selectedTemplate.components?.length) {
      text = selectedTemplate.components
        .map((c) => c.text)
        .filter(Boolean)
        .join("\n");
    } else if (selectedTemplate.body) {
      text = selectedTemplate.body;
    }

    return text;
  }, [selectedTemplate]);

  /* =========================
     CSV VALIDATION
  ========================= */

  const validateCsv = useCallback(
    (headers: string[], rows: CsvRow[]): ValidationResult => {
      const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
      const mandatory = ["name", "whatsappnumber"];
      const required = [...mandatory, ...templateVariables].map((h) =>
        h.toLowerCase()
      );

      // Check missing mandatory
      const missingMandatory = mandatory.filter(
        (h) => !normalizedHeaders.includes(h)
      );
      if (missingMandatory.length > 0) {
        return {
          isValid: false,
          error: `Missing mandatory headers: ${missingMandatory.join(", ")}`,
          warnings: [],
        };
      }

      // Check missing variables
      const missingVars = templateVariables.filter(
        (v) => !normalizedHeaders.includes(v.toLowerCase())
      );
      if (missingVars.length > 0) {
        return {
          isValid: false,
          error: `Missing template variable headers: ${missingVars.join(", ")}`,
          warnings: [],
        };
      }

      // Check extra headers
      const extra = normalizedHeaders.filter((h) => !required.includes(h));
      if (extra.length > 0) {
        return {
          isValid: false,
          error: `Invalid extra headers: ${extra.join(", ")}. Only ${required.join(", ")} allowed.`,
          warnings: [],
        };
      }

      // Exact match
      if (normalizedHeaders.length !== required.length) {
        return {
          isValid: false,
          error: `Expected exactly ${required.length} headers: ${required.join(", ")}`,
          warnings: [],
        };
      }

      // Data quality warnings
      const warnings: string[] = [];
      const emptyRows: number[] = [];
      const invalidPhones: number[] = [];
      const emptyVars: Map<string, number[]> = new Map();

      rows.forEach((row, idx) => {
        const name = row.name?.trim();
        const phone = row.whatsappnumber?.trim();

        if (!name || !phone) {
          emptyRows.push(idx + 1);
        }

        if (phone && !/^\d{10,15}$/.test(phone.replace(/[\s-]/g, ""))) {
          invalidPhones.push(idx + 1);
        }

        templateVariables.forEach((v) => {
          if (!row[v]?.trim()) {
            if (!emptyVars.has(v)) emptyVars.set(v, []);
            emptyVars.get(v)!.push(idx + 1);
          }
        });
      });

      if (emptyRows.length > 0) {
        const display = emptyRows.slice(0, 5).join(", ");
        const more = emptyRows.length > 5 ? ` (+${emptyRows.length - 5} more)` : "";
        warnings.push(`Rows with empty name/phone: ${display}${more}`);
      }

      if (invalidPhones.length > 0) {
        const display = invalidPhones.slice(0, 5).join(", ");
        const more = invalidPhones.length > 5 ? ` (+${invalidPhones.length - 5} more)` : "";
        warnings.push(`Invalid phone format in rows: ${display}${more}`);
      }

      emptyVars.forEach((rows, varName) => {
        const display = rows.slice(0, 3).join(", ");
        const more = rows.length > 3 ? ` (+${rows.length - 3} more)` : "";
        warnings.push(`Variable {{${varName}}} empty in rows: ${display}${more}`);
      });

      return {
        isValid: true,
        error: null,
        warnings: warnings.slice(0, 5),
      };
    },
    [templateVariables]
  );

  /* =========================
     FILE UPLOAD
  ========================= */

  const handleFileUpload = useCallback(
    (file: File) => {
      setFileName(file.name);
      setCsvData([]);
      setCsvHeaders([]);
      setCsvError(null);
      setCsvWarnings([]);

      const reader = new FileReader();

      reader.onload = () => {
        parse(
          reader.result as string,
          {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          },
          (err, records: CsvRow[]) => {
            if (err) {
              setCsvError(`CSV parsing failed: ${err.message}`);
              return;
            }

            if (!records || records.length === 0) {
              setCsvError("CSV file is empty");
              return;
            }

            const headers = Object.keys(records[0]);
            const validation = validateCsv(headers, records);

            if (!validation.isValid) {
              setCsvError(validation.error);
              return;
            }

            setCsvHeaders(headers);
            setCsvData(records);
            setCsvError(null);
            setCsvWarnings(validation.warnings);

            toast({
              title: "CSV Uploaded",
              description: `Loaded ${records.length} contacts`,
            });
          }
        );
      };

      reader.onerror = () => {
        setCsvError("Failed to read file");
      };

      reader.readAsText(file);
    },
    [validateCsv, toast]
  );

  /* =========================
     TEMPLATE CHANGE
  ========================= */

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = templates.find((t: TemplateFromApi) => t.id.toString() === id);
    setSelectedTemplate(tpl ?? null);

    setCsvData([]);
    setCsvHeaders([]);
    setCsvError(null);
    setCsvWarnings([]);
    setFileName("");
    setFileInputKey((prev) => prev + 1); // Reset file input
  };

  /* =========================
     FORM VALIDATION
  ========================= */

  const isFormValid =
    !!campaignName.trim() &&
    !!selectedTemplateId &&
    csvData.length > 0 &&
    !csvError;

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      await apiRequest("/api/campaigns/bulk", "POST", {
        name: campaignName.trim(),
        templateId: parseInt(selectedTemplateId!),
        contacts: csvData,
      });

      toast({
        title: "Campaign Created",
        description: `"${campaignName}" with ${csvData.length} contacts`,
      });

      router.push("/campaigns");
    } catch (error: any) {
      toast({
        title: "Failed to Create Campaign",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     COMPUTED
  ========================= */

  const templateOptions = templates.map((t: TemplateFromApi) => ({
    value: t.id.toString(),
    label: t.name,
  }));

  const requiredHeaders = useMemo(() => {
    const mandatory = ["name", "whatsappnumber"];
    return templateVariables.length > 0
      ? [...mandatory, ...templateVariables]
      : mandatory;
  }, [templateVariables]);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">New Bulk Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Create a WhatsApp campaign using Meta template messages
        </p>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Enter campaign name and select a WhatsApp template
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Summer Sale 2024"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              WhatsApp Template <span className="text-red-500">*</span>
            </label>
            <Combobox
              options={templateOptions}
              value={selectedTemplateId ?? ""}
              onChange={handleTemplateChange}
              placeholder="Select a template..."
              searchPlaceholder="Search templates..."
              emptyText={isLoading ? "Loading..." : "No templates found"}
              onSearchChange={setTemplateSearch}
            />
          </div>

          {templatePreview && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1.5">Template Preview:</div>
                <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md border">
                  {templatePreview}
                </div>
                {templateVariables.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Variables:</strong> {templateVariables.map((v) => `{{${v}}}`).join(", ")}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* CSV Upload */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Contacts</CardTitle>
            <CardDescription>
              Upload a CSV file with your contact list
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                CSV File <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <Input
                  key={fileInputKey}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="cursor-pointer"
                />
                {fileName && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                    <Upload className="h-3.5 w-3.5" />
                    {fileName}
                  </span>
                )}
              </div>

              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm">
                    <strong>Required CSV Headers (case-insensitive):</strong>
                    <div className="mt-1.5 font-mono bg-muted p-2.5 rounded text-xs border">
                      {requiredHeaders.join(", ")}
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Your CSV must contain exactly these headers - no more, no less.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {csvError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Validation Error:</strong>
                  <div className="mt-1">{csvError}</div>
                </AlertDescription>
              </Alert>
            )}

            {!csvError && csvData.length > 0 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Validation Successful!</strong>
                  <div className="mt-1">
                    {csvData.length} contact{csvData.length !== 1 ? "s" : ""} loaded
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {csvWarnings.length > 0 && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="font-medium mb-2">Data Quality Warnings:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {csvWarnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {csvData.length > 0 && !csvError && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Preview</CardTitle>
            <CardDescription>
              Showing first {Math.min(csvData.length, 10)} of {csvData.length} contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">#</th>
                    {csvHeaders.map((h) => (
                      <th key={h} className="px-4 py-2 text-left font-medium capitalize">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-2 font-medium text-muted-foreground">{i + 1}</td>
                      {csvHeaders.map((h) => (
                        <td key={h} className="px-4 py-2">
                          {row[h] || <span className="text-muted-foreground italic">empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvData.length > 10 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                ... and {csvData.length - 10} more contacts
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/campaigns")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="min-w-[140px]"
        >
          {isSubmitting ? "Creating..." : "Create Campaign"}
        </Button>
      </div>

      {selectedTemplate && !isFormValid && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Before creating campaign:</strong>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              {!campaignName.trim() && <li>Enter campaign name</li>}
              {csvData.length === 0 && <li>Upload valid CSV file</li>}
              {csvError && <li>Fix CSV validation errors</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}