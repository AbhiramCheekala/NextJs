"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/apiClient";
import { useRouter, useParams } from "next/navigation";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { FileText } from "lucide-react";

export default function EditCampaignPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id;

  const [campaignName, setCampaignName] = useState("");
  const [originalCampaignName, setOriginalCampaignName] = useState("");
  const [templatePreview, setTemplatePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (campaignId) {
      const fetchCampaign = async () => {
        try {
          const res = await apiRequest(`/api/campaigns/${campaignId}`, "GET");
          setCampaignName(res.name);
          setOriginalCampaignName(res.name);
          const preview =
            res.templateComponents
              ?.map((c: any) => c.text)
              .join("\n");
          setTemplatePreview(preview);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load campaign details.",
            variant: "destructive",
          });
        }
      };
      fetchCampaign();
    }
  }, [campaignId, toast]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (campaignName !== originalCampaignName) {
        await apiRequest(`/api/campaigns/${campaignId}`, "PATCH", {
          name: campaignName,
        });
      }

      toast({
        title: "Campaign Updated",
        description: "Campaign updated successfully.",
      });
      router.push("/campaigns");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update campaign.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Edit Campaign</h1>

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

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || campaignName === originalCampaignName}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Updating..." : "Update Campaign"}
        </Button>
      </div>
    </div>
  );
}
