
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useCampaigns } from "@/hooks/useCampaigns";
import { format } from "date-fns";

const statusVariant = (status: string) => {
  switch (status) {
    case "sent": return "default";
    case "sending": return "secondary";
    case "draft": return "outline";
    case "failed": return "destructive";
    default: return "outline";
  }
};

export default function CampaignsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { campaigns, isLoading } = useCampaigns();

  const handleViewAnalytics = (campaignName: string) => {
    toast({ title: "View Analytics", description: `Navigating to analytics for ${campaignName}. (Not implemented)` });
  };

  const handleEditCampaign = (campaignName: string) => {
    toast({ title: "Edit Campaign", description: `Opening editor for ${campaignName}. (Not implemented)` });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">Campaigns</h1>
        <Button onClick={() => router.push('/campaigns/new')}>
          <Wand2 className="mr-2 h-4 w-4" /> Create New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
          <CardDescription>
            Create, schedule, and manage your WhatsApp campaigns.
          </CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <Input placeholder="Search campaigns..." className="max-w-sm" />
            <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filters</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(campaign.status) as any}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(campaign.createdAt), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewAnalytics(campaign.name)}>View Analytics</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign.name)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
