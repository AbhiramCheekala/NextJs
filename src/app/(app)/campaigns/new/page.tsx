"use client";

import { useState } from "react";
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
import { useContacts } from "@/hooks/useContacts";
import { useTemplates } from "@/hooks/useTemplates";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
  const { contacts, isLoading: isLoadingContacts } = useContacts({
    limit: 1000,
  });

  const [templateSearch, setTemplateSearch] = useState("");
  const debouncedSearch = useDebounce(templateSearch, 400);
  const { templates, isLoading: isLoadingTemplates } =
    useTemplates(debouncedSearch);

  const { toast } = useToast();
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateObject, setSelectedTemplateObject] = useState<
    any | null
  >(null);
  const [templateVariables, setTemplateVariables] = useState<
    Record<string, string>
  >({});
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState("");

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = (checked: boolean) => {
    if (checked && contacts) {
      setSelectedContacts(contacts.map((c) => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t: any) => t.id.toString() === templateId);
    setSelectedTemplateObject(template || null);
    setTemplateVariables({});
  };

  const handleVariableChange = (variable: string, value: string) => {
    setTemplateVariables((prev) => ({ ...prev, [variable]: value }));
  };

  const getTemplateVariables = () => {
    if (!selectedTemplateObject || !selectedTemplateObject.components)
      return [];
    const variables = new Set<string>();
    selectedTemplateObject.components.forEach((component: any) => {
      if (component.text) {
        const matches = component.text.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach((match: string) => variables.add(match));
        }
      }
    });
    return Array.from(variables);
  };

  const handleSubmit = async () => {
    if (!campaignName || !selectedTemplate || selectedContacts.length === 0) {
      toast({
        title: "Error",
        description:
          "Please fill in all fields and select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("/api/campaigns", "POST", {
        name: campaignName,
        templateId: selectedTemplate,
        contactIds: selectedContacts,
        templateVariables,
      });
      toast({
        title: "Campaign Created",
        description:
          "The campaign has been created and messages are being sent.",
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

  const templateOptions = templates.map((template: any) => ({
    value: template.id.toString(),
    label: template.name,
  }));

  const variables = getTemplateVariables();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-headline font-semibold">New Campaign</h1>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Select a template and the contacts to send the message to.
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
          {variables.map((variable) => (
            <Input
              key={variable}
              placeholder={`Variable ${variable}`}
              onChange={(e) => handleVariableChange(variable, e.target.value)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Contacts</CardTitle>
          <CardDescription>
            Choose the contacts you want to include in this campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="select-all"
              checked={
                selectedContacts.length === contacts.length &&
                contacts.length > 0
              }
              onCheckedChange={(checked: boolean) =>
                handleSelectAllContacts(checked)
              }
            />
            <label htmlFor="select-all">Select All</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingContacts ? (
              <p>Loading contacts...</p>
            ) : (
              contacts?.map((contact: any) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={contact.id}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => handleSelectContact(contact.id)}
                  />
                  <label htmlFor={contact.id}>{contact.name}</label>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit}>Create Campaign</Button>
    </div>
  );
}
