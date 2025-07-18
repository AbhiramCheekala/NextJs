
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CalendarDays, ListChecks, MessageSquareReply, Goal, BarChart3, Users, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { TimeRangePicker } from "@/components/dashboard/time-range-picker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MessagesFlowChart } from "@/components/dashboard/messages-flow-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockCampaignPerformance = [
  { id: "C001", name: "Summer Sale Blast", status: "Completed", sent: 1500, deliveryRate: "95%", readRate: "70%", replyRate: "15%", conversions: 75 },
  { id: "C002", name: "New Product Teaser", status: "Active", sent: 800, deliveryRate: "98%", readRate: "80%", replyRate: "20%", conversions: 50 },
  { id: "C003", name: "Feedback Request Q3", status: "Completed", sent: 1200, deliveryRate: "92%", readRate: "65%", replyRate: "10%", conversions: 0 },
  { id: "C004", name: "Holiday Promo", status: "Scheduled", sent: 2000, deliveryRate: "N/A", readRate: "N/A", replyRate: "N/A", conversions: 0 },
];

const mockTemplatePerformance = [
  { id: "T001", name: "Welcome Offer", category: "MARKETING", used: 500, approval: "Approved", readRate: "85%", replyRate: "25%" },
  { id: "T002", name: "Order Confirmation", category: "UTILITY", used: 1200, approval: "Approved", readRate: "95%", replyRate: "5%" },
  { id: "T003", name: "Abandoned Cart Reminder", category: "MARKETING", used: 300, approval: "Pending", readRate: "N/A", replyRate: "N/A" },
  { id: "T004", name: "Shipping Update", category: "UTILITY", used: 950, approval: "Approved", readRate: "92%", replyRate: "3%" },
];

const statusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed": return "default";
    case "active": return "secondary";
    case "scheduled": return "outline";
    case "approved": return "default";
    case "pending": return "secondary";
    default: return "outline";
  }
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
            <TimeRangePicker />
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard title="Total Messages Sent" value="15,870" icon={BarChart3} change="+5% last period" changeType="positive" />
        <KpiCard title="Overall Delivery Rate" value="92.5%" icon={TrendingUp} change="-0.2% last period" changeType="negative" />
        <KpiCard title="Average Read Rate" value="71.3%" icon={TrendingUp} change="+1.5% last period" changeType="positive" />
        <KpiCard title="Average Reply Rate" value="18.2%" icon={MessageSquareReply} change="+0.5% last period" changeType="positive" />
        <KpiCard title="Total Opt-Outs" value="123" icon={Users} change="+10 last period" changeType="negative" />
        <KpiCard title="Total Campaigns Analyzed" value="12" icon={ListChecks} change="+2 last period" changeType="positive" />
        <KpiCard title="Avg. Conversion Rate" value="5.7%" icon={Goal} change="-0.1% last period" changeType="negative" />
        <KpiCard title="Most Used Template" value="Order Conf." icon={FileText} change="1.2k uses" changeType="neutral" />
      </div>
      
      {/* Campaign Performance Overview Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Overall Message Funnel</CardTitle>
          <CardDescription>Aggregated message flow across all campaigns for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <MessagesFlowChart /> {/* Re-using existing chart component */}
        </CardContent>
      </Card>

      {/* Campaign Performance Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Campaign Performance Breakdown</CardTitle>
          <CardDescription>Detailed metrics for individual campaigns in the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Delivery %</TableHead>
                <TableHead className="text-right">Read %</TableHead>
                <TableHead className="text-right">Reply %</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCampaignPerformance.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell><Badge variant={statusVariant(campaign.status) as any}>{campaign.status}</Badge></TableCell>
                  <TableCell className="text-right">{campaign.sent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.deliveryRate}</TableCell>
                  <TableCell className="text-right">{campaign.readRate}</TableCell>
                  <TableCell className="text-right">{campaign.replyRate}</TableCell>
                  <TableCell className="text-right">{campaign.conversions}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Template Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Template Performance</CardTitle>
          <CardDescription>Effectiveness of your message templates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Times Used</TableHead>
                <TableHead>Meta Status</TableHead>
                <TableHead className="text-right">Read %</TableHead>
                <TableHead className="text-right">Reply %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTemplatePerformance.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell className="text-right">{template.used.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusVariant(template.approval) as any}>{template.approval}</Badge></TableCell>
                  <TableCell className="text-right">{template.readRate}</TableCell>
                  <TableCell className="text-right">{template.replyRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Placeholder for more charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Advanced Funnel Analysis</CardTitle>
            <CardDescription>Visualize multi-step conversion funnels for specific campaign goals (e.g., Sent &rarr; Delivered &rarr; Read &rarr; Replied &rarr; Clicked Link &rarr; Converted).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Customizable funnel stages and drop-off rates will be visualized here.</p>
            <div data-ai-hint="funnel chart stages" className="h-64 bg-muted rounded-md flex items-center justify-center mt-2">Advanced Funnel Chart Area</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Engagement Trends</CardTitle>
            <CardDescription>Track how user engagement (replies, clicks) evolves over time or by audience segment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Line charts for daily/weekly engagement, or bar charts comparing tags/segments.</p>
            <div data-ai-hint="engagement line chart" className="h-64 bg-muted rounded-md flex items-center justify-center mt-2">Engagement Trends Chart Area</div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-muted-foreground mt-6">Further deep dive charts for A/B testing, cost analysis, and geographic performance will be added.</p>
    </div>
  );
}

