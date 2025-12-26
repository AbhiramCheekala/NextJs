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
  ArrowRight,
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
     VALIDATION STATE
  ======================= */

  const [validation, setValidation] = useState<{
    hasName: boolean;
    hasPhone: boolean;
    invalidPhones: { row: number; phone: string }[];
    missingVars: string[];
    unknownCols: string[];
  } | null>(null);

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
     CSV VALIDATION
  ======================= */

  const templateVars = useMemo(() => {
    if (!selectedTemplate) return [];
    const fullText =
      selectedTemplate.components?.map((c) => c.text).join("\n") ||
      selectedTemplate.body ||
      "";
    const matches = fullText.match(/{{(.*?)}}/g);
    if (!matches) return [];
    // Extract variable name and trim whitespace
    return matches.map((v) => v.slice(2, -2).trim());
  }, [selectedTemplate]);

  useEffect(() => {
    if (!csvData.length || !selectedTemplate) {
      setValidation(null);
      return;
    }

    const headers = Object.keys(csvData[0]);
    const hasName = headers.includes("name");
    const hasPhone = headers.includes("phone");

    const invalidPhones: { row: number; phone: string }[] = [];
    if (hasPhone) {
      const indianPhoneRegex = /^(?:(?:\+91|91)?[6-9]\d{9})$/;
      csvData.forEach((row, index) => {
        const phone = row.phone || "";
        if (!indianPhoneRegex.test(phone)) {
          invalidPhones.push({ row: index + 2, phone }); // CSV row number is index + 2 (with header)
        }
      });
    }

    const missingVars = templateVars.filter((v) => !headers.includes(v));
    const knownCols = ["name", "phone", ...templateVars];
    const unknownCols = headers.filter((h) => !knownCols.includes(h));

    setValidation({
      hasName,
      hasPhone,
      invalidPhones,
      missingVars,
      unknownCols,
    });
  }, [csvData, selectedTemplate, templateVars]);

  /* =======================
     CSV UPLOAD
  ======================= */

  const handleFileUpload = (file: File) => {
    // Reset state for re-uploads
    setCsvData([]);
    setValidation(null);
    setCsvError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      parse(
        reader.result as string,
        { columns: true, trim: true },
        (err, records: CsvRow[]) => {
          if (err || records.length === 0) {
            setCsvError(
              "Could not parse CSV file. Make sure it's a valid, non-empty CSV."
            );
            return;
          }

          // Sanitize headers: remove curly braces and trim whitespace
          const sanitizedRecords = records.map((record) => {
            const newRecord: CsvRow = {};
            for (const key in record) {
              const sanitizedKey = key.replace(/{{|}}/g, "").trim();
              newRecord[sanitizedKey] = record[key];
            }
            return newRecord;
          });

          setCsvData(sanitizedRecords);
        }
      );
    };
    reader.readAsText(file);
  };

  /* =======================
     SUBMIT
  ======================= */

  const handleSubmit = async () => {
    if (
      !campaignName ||
      !selectedTemplate ||
      !csvData.length ||
      !validation ||
      !validation.hasName ||
      !validation.hasPhone ||
      validation.missingVars.length > 0 ||
      validation.invalidPhones.length > 0
    )
      return;

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

  const isValidationGood =
    !!validation &&
    validation.hasName &&
    validation.hasPhone &&
    validation.invalidPhones.length === 0 &&
    validation.missingVars.length === 0;

  const isSubmitDisabled =
    !campaignName ||
    !selectedTemplate ||
    !csvData.length ||
    isSubmitting ||
    !isValidationGood;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Create a New Bulk Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Send a WhatsApp message to a list of contacts from a CSV file.
        </p>
      </div>

      {/* CAMPAIGN NAME */}
      <Card>
        <CardHeader>
          <CardTitle>1. Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="E.g. 'January Newsletter'"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* TEMPLATE SEARCH */}
      <Card>
        <CardHeader>
          <CardTitle>2. Select Template</CardTitle>
          <CardDescription>
            Choose the WhatsApp-approved message template you want to send.
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
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-t ${
                      selectedTemplate?.id === t.id ? "bg-muted" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">{t.category}</td>
                    <td className="px-4 py-2">{t.status}</td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedTemplate(t)}
                        disabled={selectedTemplate?.id === t.id}
                      >
                        {selectedTemplate?.id === t.id ? "Selected" : "Select"}
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

          {meta && meta.totalPages > 1 && (
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
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {templatePreview}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {/* CSV UPLOAD */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>3. Upload Contacts CSV</CardTitle>
            <CardDescription>
              Your file must contain 'name' and 'phone' columns. Phone numbers
              must be valid 10-digit Indian numbers (e.g., '9493041259',
              '919493041259', or '+919493041259').
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              key={fileKey}
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files[0]);
                  // Increment key to allow re-uploading the same file
                  setFileKey((prev) => prev + 1);
                }
              }}
              className="max-w-sm"
            />
            {fileName && csvData.length > 0 && (
              <div className="mt-4 p-3 border rounded-md bg-muted/50">
                <p className="text-sm font-semibold">
                  File Uploaded: {fileName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Contacts: {csvData.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Recognized Columns: {Object.keys(csvData[0]).join(", ")}
                </p>
              </div>
            )}
            {csvError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{csvError}</AlertDescription>
              </Alert>
            )}

            {csvData.length > 0 && <CsvPreviewTable data={csvData} />}
          </CardContent>
        </Card>
      )}

      {/* VALIDATION RESULT */}
      {validation && (
        <Card
          className={
            isValidationGood ? "border-green-300" : "border-red-300"
          }
        >
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 ${
                isValidationGood ? "text-green-600" : "text-red-600"
              }`}
            >
              {isValidationGood ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>Validation Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ValidationItem
              label="Column 'name' is present"
              isValid={validation.hasName}
            />
            <ValidationItem
              label="Column 'phone' is present"
              isValid={validation.hasPhone}
            />
            {validation.hasPhone && (
              <ValidationItem
                label="All phone numbers are valid"
                isValid={validation.invalidPhones.length === 0}
                errorDetails={
                  validation.invalidPhones.length > 0
                    ? `Invalid numbers found at rows: ${validation.invalidPhones
                        .map((p) => p.row)
                        .join(", ")}`
                    : undefined
                }
              />
            )}
            {templateVars.length > 0 && (
              <div className="pt-2">
                <h4 className="font-semibold mb-2">
                  Template Variables Check
                </h4>
                {templateVars.map((v) => (
                  <ValidationItem
                    key={v}
                    label={`Column '{{${v}}}' is present`}
                    isValid={!validation.missingVars.includes(v)}
                  />
                ))}
              </div>
            )}
            {validation.unknownCols.length > 0 && (
              <Alert variant="default" className="mt-4">
                <AlertDescription>
                  <strong>Heads up:</strong> The following columns were found
                  but are not used as variables:{" "}
                  <span className="font-mono">
                    {validation.unknownCols.join(", ")}
                  </span>
                  . They will be ignored.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          Cancel
        </Button>
        <Button disabled={isSubmitDisabled} onClick={handleSubmit}>
          {isSubmitting ? (
            "Creating..."
          ) : (
            <>
              Create Campaign
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* =======================
   VALIDATION ITEM COMPONENT
======================= */

const ValidationItem = ({
  label,
  isValid,
  errorDetails,
}: {
  label: string;
  isValid: boolean;
  errorDetails?: string;
}) => (
  <div>
    <div className="flex items-center">
      {isValid ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
      )}
      <span className={isValid ? "text-muted-foreground" : "text-red-600"}>
        {label}
      </span>
    </div>
    {!isValid && errorDetails && (
      <p className="text-xs text-red-500 ml-6 mt-1">{errorDetails}</p>
    )}
  </div>
);

/* =======================
   CSV PREVIEW TABLE COMPONENT
======================= */

const CsvPreviewTable = ({ data }: { data: CsvRow[] }) => {
  const [showAll, setShowAll] = useState(false);
  const headers = Object.keys(data[0] || {});
  const displayedData = showAll ? data : data.slice(0, 5);

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">CSV Data Preview</h4>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-2 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, i) => (
              <tr key={i} className="border-t">
                {headers.map((h) => (
                  <td key={h} className="px-4 py-2 truncate">
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 5 && (
        <Button
          variant="link"
          size="sm"
          className="mt-2 px-0"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `Show ${data.length - 5} more rows`}
        </Button>
      )}
    </div>
  );
};
