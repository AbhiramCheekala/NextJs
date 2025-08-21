
'use client';

import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { TimeRangePicker } from '@/components/dashboard/time-range-picker';
import { TagFilter } from '@/components/dashboard/tag-filter';
import { MessagesFlowChart } from '@/components/dashboard/messages-flow-chart';
import { RecentCampaignsTable } from '@/components/dashboard/recent-campaigns-table';
import { ErrorFeed } from '@/components/dashboard/error-feed';
import { IncomingRepliesFeed } from '@/components/dashboard/incoming-replies-feed';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, TrendingUp, MessageCircleReply, XCircle, SendHorizonal, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const { dashboardData, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Command Center</h1>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Could Not Load Dashboard
            </CardTitle>
            <CardDescription>
              There was an error fetching the dashboard data. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const { kpis, recentCampaigns, errorFeed, incomingReplies } = dashboardData;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Command Center</h1>
        <div className="flex items-center gap-2">
          <TimeRangePicker />
          <TagFilter />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Messages Sent" value={kpis.messagesSent.toLocaleString()} icon={SendHorizonal} />
        <KpiCard title="Messages Delivered" value={kpis.messagesDelivered.toLocaleString()} icon={CheckCircle2} />
        <KpiCard title="Messages Read" value={kpis.messagesRead.toLocaleString()} icon={TrendingUp} />
        <KpiCard title="Messages Replied" value={kpis.messagesReplied.toLocaleString()} icon={MessageCircleReply} />
        <KpiCard title="Messages Failed" value={kpis.messagesFailed.toLocaleString()} icon={XCircle} changeType="negative" />
      </div>

      {/* Charts and Feeds */}
      <div className="grid gap-6 md:grid-cols-1">
        <RecentCampaignsTable campaigns={recentCampaigns} />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ErrorFeed errors={errorFeed} />
        <IncomingRepliesFeed replies={incomingReplies} />
      </div>
    </div>
  );
}
