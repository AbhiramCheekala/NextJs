"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOutboxCampaigns } from "@/hooks/useOutboxCampaigns";
import { apiRequest } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "sent": return "default";
    case "completed": return "default";
    case "sending": return "secondary";
    case "paused": return "outline";
    case "failed": return "destructive";
    default: return "outline";
  }
};

interface CampaignSummary {
  campaignId: number;
  campaignName: string;
  templateName: string;
  status: string;
  totalMessages: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  progress: number;
  failureRate: number;
}

export default function LiveOutboxPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("completed,sent,failed");
  const { 
    campaigns, 
    isLoading, 
    isError, 
    refresh, 
    loadMore, 
    hasReachedEnd, 
    isLoadingMore 
  } = useOutboxCampaigns(searchTerm, status);
  const { toast } = useToast();

  const handleStatusUpdate = async (campaignId: number, newStatus: "sending" | "paused") => {
    console.log(`Attempting to update campaign ${campaignId} to status: ${newStatus}`);
    try {
      const response = await apiRequest(
        `/api/campaigns/${campaignId}/status`,
        "PATCH",
        { status: newStatus }
      );
      console.log('Successfully updated campaign status. API response:', response);
      toast({
        title: "Success",
        description: `Campaign ${newStatus === "paused" ? "paused" : "resumed"} successfully.`,
      });
      refresh();
    } catch (_error) {
      console.error(`Failed to update campaign ${campaignId} status.`, _error);
      toast({
        title: "Error",
        description: `Failed to ${newStatus === "paused" ? "pause" : "resume"} campaign.`,
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setStatus(value);
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-semibold">Live Outbox</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Outbox Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error fetching the outbox summary. Please try again later.</p>
            <Button onClick={() => refresh()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">Live Outbox</h1>
        <div className="flex gap-2">
          <Input 
            placeholder="Search campaigns..." 
            className="max-w-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => refresh()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="completed" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="completed,sent,failed">Completed</TabsTrigger>
          <TabsTrigger value="sending">Sending</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && !campaigns.length ? (
         <div className="flex flex-col gap-6">
         <Card>
           <CardHeader>
             <CardTitle>Loading Outbox Data...</CardTitle>
           </CardHeader>
           <CardContent>
             <p>Please wait while we fetch the latest campaign summaries.</p>
           </CardContent>
         </Card>
       </div>
      ) : campaigns && campaigns.length > 0 ? (
        <>
          {campaigns.map((campaignSummary: CampaignSummary) => (
            <Card key={campaignSummary.campaignId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Campaign: {campaignSummary.campaignName}</CardTitle>
                    <CardDescription>
                      Template: {campaignSummary.templateName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(campaignSummary.status)}>{campaignSummary.status}</Badge>
                  {campaignSummary.status === "sending" && (
                    <Button variant="outline" size="icon" onClick={() => handleStatusUpdate(campaignSummary.campaignId, "paused")}>
                      <PauseCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {campaignSummary.status === "paused" && (
                    <Button variant="outline" size="icon" onClick={() => handleStatusUpdate(campaignSummary.campaignId, "sending")}>
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  )}
                  </div>
                </div>
                <div className="pt-2">
                  <Progress value={campaignSummary.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaignSummary.progress}% complete ({campaignSummary.sentCount + campaignSummary.failedCount} / {campaignSummary.totalMessages} messages processed)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sent: {campaignSummary.sentCount} | Failed: {campaignSummary.failedCount} ({campaignSummary.failureRate}%) | Pending: {campaignSummary.pendingCount}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
          {!hasReachedEnd && (
            <div className="flex justify-center">
              <Button onClick={loadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Campaigns in Outbox</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no campaigns to display for the selected filter. {searchTerm && "Try clearing your search."}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
