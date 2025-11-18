"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, RefreshCw, ListFilter } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOutboxSummary } from "@/hooks/useOutboxSummary";

const statusVariant = (status: string) => {
  switch (status) {
    case "sent": return "default";
    case "delivered": return "secondary";
    case "read": return "default";
    case "pending": return "outline";
    case "failed": return "destructive";
    default: return "outline";
  }
};

export default function LiveOutboxPage() {
  const { summary, isLoading, isError, refresh } = useOutboxSummary();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-semibold">Live Outbox</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading Outbox Data...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we fetch the latest campaign summaries.</p>
          </CardContent>
        </Card>
      </div>
    );
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
            <Button onClick={refresh} className="mt-4">
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
          <Button variant="outline"><PauseCircle className="mr-2 h-4 w-4" /> Pause All</Button>
          <Button><PlayCircle className="mr-2 h-4 w-4" /> Resume All</Button>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {summary && summary.length > 0 ? (
        summary.map((campaignSummary: any) => (
          <Card key={campaignSummary.campaignId}>
            <CardHeader>
              <CardTitle>Campaign Progress: {campaignSummary.campaignName}</CardTitle>
              <CardDescription>
                Template: {campaignSummary.templateName} | Status: {campaignSummary.status}
              </CardDescription>
              <div className="pt-2">
                <Progress value={campaignSummary.progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">
                  {campaignSummary.progress}% complete ({campaignSummary.sentCount + campaignSummary.failedCount} / {campaignSummary.totalMessages} messages processed)
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sent: {campaignSummary.sentCount} | Failed: {campaignSummary.failedCount} ({campaignSummary.failureRate}%) | Pending: {campaignSummary.pendingCount}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Input placeholder="Filter by contact or status..." className="max-w-sm" />
                <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filters</Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Individual message details can be fetched and displayed here if needed */}
              <p className="text-center text-muted-foreground mt-6">
                Individual message streaming for this campaign will be implemented here.
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Campaigns in Outbox</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no active or recently completed campaigns to display in the outbox.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
