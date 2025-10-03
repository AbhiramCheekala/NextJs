'use client';

import { useCampaign } from "@/hooks/useCampaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignDetails({ id }: { id: string }) {
  const { campaign, loading, error } = useCampaign(id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Status: {campaign.status}</div>
        <div>Created At: {new Date(campaign.createdAt).toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
