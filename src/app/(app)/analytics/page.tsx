"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  ListChecks,
  MessageSquareReply,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { TimeRangePicker } from "@/components/dashboard/time-range-picker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MessagesFlowChart } from "@/components/dashboard/messages-flow-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalytics, CampaignPerformance } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { CampaignDetailsModal } from "@/components/analytics/campaign-details-modal";

export default function AnalyticsPage() {
  const [page, setPage] = useState(1);
  const { analytics, isLoading, error } = useAnalytics(page, 5);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignPerformance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (campaign: CampaignPerformance) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-headline font-semibold">
            Analytics Dashboard
          </h1>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Could Not Load Analytics Data
            </CardTitle>
            <CardDescription>
              There was an error fetching the analytics data from the server.
              Please try refreshing the page in a few moments.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-10 w-1/2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const {
    kpis = {
      totalCampaigns: 0,
      replyRate: 0,
      totalMessagesSent: 0,
      totalRepliesReceived: 0,
    },
    messageStatusBreakdown = [],
    campaignPerformance = [],
    pagination,
  } = analytics;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">
          Analytics Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <TimeRangePicker />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Campaigns"
          value={kpis?.totalCampaigns?.toLocaleString() || "0"}
          icon={ListChecks}
        />
        <KpiCard
          title="Total Messages Sent"
          value={kpis?.totalMessagesSent?.toLocaleString() || "0"}
          icon={BarChart3}
        />
        <KpiCard
          title="Total Replies Received"
          value={kpis?.totalRepliesReceived?.toLocaleString() || "0"}
          icon={MessageSquareReply}
        />
        <KpiCard
          title="Overall Reply Rate"
          value={`${kpis?.replyRate || "0.00"}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Message Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Overall Message Funnel
          </CardTitle>
          <CardDescription>
            Aggregated message flow across all campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* The chart component will need to be adapted to accept this data structure */}
          <MessagesFlowChart data={messageStatusBreakdown || []} />
        </CardContent>
      </Card>

      {/* Campaign Performance Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Campaign Performance Breakdown
          </CardTitle>
          <CardDescription>
            Detailed metrics for your most recent campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Replies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(campaignPerformance || []).map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    {format(new Date(campaign.createdAt), "PPP")}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.messagesSent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.repliesReceived.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(campaign)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination?.page} of {pagination?.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination?.totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      <CampaignDetailsModal
        campaign={selectedCampaign}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
