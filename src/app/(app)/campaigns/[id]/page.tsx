"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Send,
    CheckCircle2,
    Eye,
    XCircle,
    MessageSquareReply,
    Percent,
} from "lucide-react";

export default function CampaignAnalyticsPage() {
    const params = useParams();
    const campaignId = params?.id ? Number(params.id) : null;

    const { analytics, isLoading, error, refetch } =
        useCampaignAnalytics(campaignId);

    const [isRefreshing, setIsRefreshing] = useState(false);

    if (!campaignId) {
        return <div className="p-6 text-red-500">Invalid campaign ID</div>;
    }

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Campaign Analytics — #{campaignId}
                </h1>

                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    className={`
            flex items-center gap-2 px-4 py-2 border rounded-md transition
            ${isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
          `}
                >
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Loading State */}
            {(isLoading || isRefreshing) && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-red-500">
                    Failed to load analytics. Please try again.
                </div>
            )}

            {/* Data */}
            {analytics && !(isLoading || isRefreshing) && !error && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KpiCard title="Sent" value={analytics.sent} icon={Send} />
                    <KpiCard title="Delivered" value={analytics.delivered} icon={CheckCircle2} />
                    <KpiCard title="Read" value={analytics.read} icon={Eye} />
                    <KpiCard title="Failed" value={analytics.failed} icon={XCircle} />
                    <KpiCard
                        title="Replies"
                        value={analytics.repliesReceived}
                        icon={MessageSquareReply}
                    />
                    <KpiCard
                        title="Delivery Rate"
                        value={`${analytics.deliveryRate}%`}
                        icon={Percent}
                    />
                    <KpiCard
                        title="Reply Rate"
                        value={`${analytics.replyRate}%`}
                        icon={Percent}
                    />
                </div>
            )}
        </div>
    );
}
