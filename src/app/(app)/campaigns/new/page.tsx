"use client";

import { useState, useMemo } from "react";
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
import { useCampaignCsvData } from "@/hooks/useCampaignCsvData";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface TemplateComponent {
  text: string;
}

interface Template {
  id: number;
  name: string;
  components: TemplateComponent[];
}

export default function NewCampaignPage() {
  const [templateSearch, setTemplateSearch] = useState("");
  const debouncedSearch = useDebounce(templateSearch, 400);
  const { templates, isLoading: isLoadingTemplates } =
    useTemplates(debouncedSearch);

  const { toast } = useToast();
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateObject, setSelectedTemplateObject] = useState<
    Template | null
  >(null);
  const [campaignName, setCampaignName] = useState("");
  const { csvData, csvHeaders, csvError, handleFileUpload } =
    useCampaignCsvData();

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t: Template) => t.id.toString() === templateId);
    setSelectedTemplateObject(template || null);
  };

  const templateVariables = useMemo(() => {
    if (!selectedTemplateObject || !selectedTemplateObject.components)
      return [];
    const variables = new Set<string>();
    selectedTemplateObject.components.forEach((component: TemplateComponent) => {
      if (component.text) {
        const matches = component.text.match(/{{(.*?)}}/g);
        if (matches) {
          matches.forEach((match: string) =>
            variables.add(match.replace(/{{|}}/g, ""))
          );
        }
      }
    });
    return Array.from(variables);
  }, [selectedTemplateObject]);

  const handleSubmit = async () => {
    if (!campaignName || !selectedTemplate || csvData.length === 0) {
      toast({
        title: "Error",
        description:
          "Please fill in all fields and upload a CSV with contacts.",
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
        description:
          "The campaign has been created and messages will be sent shortly.",
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
      <h1 className="text-3xl font-headline font-semibold">New Bulk Campaign</h1>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Select a template and upload a CSV with your contacts.
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
              isLoadingTemplates ? "Loading..." : "No templates found."
            }
            onSearchChange={setTemplateSearch}
          />
          {selectedTemplate && (
            <div>
              <label htmlFor="csv-upload" className="text-sm font-medium">
                Upload Contacts (CSV)
              </label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files) {
                    const requiredHeaders = ["name", "whatsappnumber", ...templateVariables];
                    handleFileUpload(e.target.files[0], requiredHeaders);
                  }
                }}
                className="mt-1"
              />
              {templateVariables.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Your CSV must contain the following columns:{" "}
                  <strong>name, whatsappnumber, {templateVariables.join(", ")}</strong>
                </p>
              )}
              {csvError && (
                <p className="text-sm text-red-500 mt-2">{csvError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Contacts</CardTitle>
            <CardDescription>
              Review the contacts that will be included in this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvHeaders.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {csvHeaders.map((header) => (
                        <TableCell key={header}>{row[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit} disabled={!selectedTemplate || csvData.length === 0}>
        Create Campaign
      </Button>
    </div>
  );
}

