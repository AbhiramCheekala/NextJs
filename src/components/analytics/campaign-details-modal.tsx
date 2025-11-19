"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, CheckCircle2, Eye, XCircle, MessageSquareReply, Percent } from "lucide-react";
import { CampaignPerformance } from "@/hooks/useAnalytics";

interface CampaignDetailsModalProps {
  campaign: CampaignPerformance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailsModal({
  campaign,
  open,
  onOpenChange,
}: CampaignDetailsModalProps) {
  const { analytics, isLoading, error } = useCampaignAnalytics(campaign?.id ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{campaign?.name}</DialogTitle>
          <DialogDescription>
            Detailed analytics for this campaign.
          </DialogDescription>
        </DialogHeader>
        {isLoading || !analytics ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 p-6">Failed to load campaign details.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
            <KpiCard title="Sent" value={analytics.sent.toLocaleString()} icon={Send} />
            <KpiCard title="Delivered" value={analytics.delivered.toLocaleString()} icon={CheckCircle2} />
            <KpiCard title="Read" value={analytics.read.toLocaleString()} icon={Eye} />
            <KpiCard title="Failed" value={analytics.failed.toLocaleString()} icon={XCircle} />
            <KpiCard title="Replies" value={analytics.repliesReceived.toLocaleString()} icon={MessageSquareReply} />
            <KpiCard title="Delivery Rate" value={`${analytics.deliveryRate}%`} icon={Percent} />
            <KpiCard title="Reply Rate" value={`${analytics.replyRate}%`} icon={Percent} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
