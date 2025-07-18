
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { TimeRangePicker } from '@/components/dashboard/time-range-picker';
import { TagFilter } from '@/components/dashboard/tag-filter';
import { MessagesFlowChart } from '@/components/dashboard/messages-flow-chart';
import { TopCampaignsChart } from '@/components/dashboard/top-campaigns-chart';
import { AudienceTagsChart } from '@/components/dashboard/audience-tags-chart';
import { QueueLatencyChart } from '@/components/dashboard/queue-latency-chart';
import { RecentCampaignsTable } from '@/components/dashboard/recent-campaigns-table';
import { ErrorFeed } from '@/components/dashboard/error-feed';
import { IncomingRepliesFeed } from '@/components/dashboard/incoming-replies-feed';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { 
  ArrowUpRight, CheckCircle2, TrendingUp, TrendingDown, XCircle, MessageCircleReply, AlertTriangle, BarChartHorizontalBig, Clock, Users, Percent, Gauge, SendHorizonal, BatteryCharging
} from 'lucide-react'; // Added Gauge, SendHorizonal, BatteryCharging

// Mock data for KPIs
const kpiData = {
  messagesQueued: { value: 1256, change: "+20% from yesterday", changeType: 'positive' as const, icon: ArrowUpRight },
  messagesSent: { value: '95%', change: "1193 sent", changeType: 'neutral' as const, icon: CheckCircle2 },
  messagesDelivered: { value: '88%', change: "1105 delivered", changeType: 'neutral' as const, icon: CheckCircle2 },
  messagesRead: { value: '65%', change: "817 read", changeType: 'neutral' as const, icon: TrendingUp },
  messagesReplied: { value: '12%', change: "150 replied", changeType: 'neutral' as const, icon: MessageCircleReply },
  messagesFailed: { value: '2%', change: "25 failed", changeType: 'negative' as const, icon: XCircle },
  optOutsToday: { value: 5, change: "+2 from yesterday", changeType: 'negative' as const, icon: Users },
  costEstimate: { value: '$45.80', change: "Credits used: 916", changeType: 'neutral' as const, icon: Percent },
  apiRateLimit: { value: '85%', change: "Healthy", changeType: 'positive' as const, icon: BarChartHorizontalBig },
  dailySendingLimit: { value: '10,000', change: "Tier 2 Limit", changeType: 'neutral' as const, icon: Gauge },
  messagesUsedToday: { value: '4,500', change: "45% of limit", changeType: 'neutral' as const, icon: SendHorizonal },
  messagesRemainingToday: { value: '5,500', change: "55% remaining", changeType: 'positive' as const, icon: BatteryCharging },
};

export default function DashboardPage() {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Changed to xl:grid-cols-4 for better layout with more cards */}
        <KpiCard title="Messages Queued" value={kpiData.messagesQueued.value} icon={kpiData.messagesQueued.icon} change={kpiData.messagesQueued.change} changeType={kpiData.messagesQueued.changeType} onClick={() => alert('Navigate to Analytics for Queued Msgs')} />
        <KpiCard title="Messages Sent" value={kpiData.messagesSent.value} icon={kpiData.messagesSent.icon} change={kpiData.messagesSent.change} onClick={() => alert('Navigate to Analytics for Sent Msgs')} />
        <KpiCard title="Messages Delivered" value={kpiData.messagesDelivered.value} icon={kpiData.messagesDelivered.icon} change={kpiData.messagesDelivered.change} onClick={() => alert('Navigate to Analytics for Delivered Msgs')} />
        <KpiCard title="Messages Read" value={kpiData.messagesRead.value} icon={kpiData.messagesRead.icon} change={kpiData.messagesRead.change} onClick={() => alert('Navigate to Analytics for Read Msgs')} />
        
        <KpiCard title="Daily Sending Limit" value={kpiData.dailySendingLimit.value} icon={kpiData.dailySendingLimit.icon} change={kpiData.dailySendingLimit.change} onClick={() => alert('Navigate to Meta Business Manager for details')} />
        <KpiCard title="Messages Used Today" value={kpiData.messagesUsedToday.value} icon={kpiData.messagesUsedToday.icon} change={kpiData.messagesUsedToday.change} />
        <KpiCard title="Messages Remaining Today" value={kpiData.messagesRemainingToday.value} icon={kpiData.messagesRemainingToday.icon} change={kpiData.messagesRemainingToday.change} changeType={kpiData.messagesRemainingToday.changeType} />
        <KpiCard title="API Rate Limit Usage" value={kpiData.apiRateLimit.value} icon={kpiData.apiRateLimit.icon} change={kpiData.apiRateLimit.change} changeType={kpiData.apiRateLimit.changeType} />

        <KpiCard title="Messages Replied" value={kpiData.messagesReplied.value} icon={kpiData.messagesReplied.icon} change={kpiData.messagesReplied.change} onClick={() => alert('Navigate to Analytics for Replied Msgs')} />
        <KpiCard title="Messages Failed" value={kpiData.messagesFailed.value} icon={kpiData.messagesFailed.icon} change={kpiData.messagesFailed.change} changeType={kpiData.messagesFailed.changeType} onClick={() => alert('Navigate to Analytics for Failed Msgs')} />
        <KpiCard title="Opt-outs Today" value={kpiData.optOutsToday.value} icon={kpiData.optOutsToday.icon} change={kpiData.optOutsToday.change} changeType={kpiData.optOutsToday.changeType} onClick={() => alert('Navigate to Analytics for Opt-outs')} />
        <KpiCard title="Cost Estimate" value={kpiData.costEstimate.value} icon={kpiData.costEstimate.icon} change={kpiData.costEstimate.change} onClick={() => alert('Navigate to Billing')} />
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <Label htmlFor="auto-refresh-toggle">Auto-refresh</Label>
        <Switch id="auto-refresh-toggle" />
        <Select defaultValue="30s">
            <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="Interval" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="5s">5s</SelectItem>
                <SelectItem value="30s">30s</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <MessagesFlowChart />
        <TopCampaignsChart />
        <AudienceTagsChart />
        <QueueLatencyChart />
      </div>

      {/* Tables/Feeds Grid */}
      <div className="grid gap-6 md:grid-cols-1">
        <RecentCampaignsTable />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ErrorFeed />
        <IncomingRepliesFeed />
      </div>

    </div>
  );
}
