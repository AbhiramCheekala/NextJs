
'use client';

import { useState, useEffect } from "react";
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
import { Badge, BadgeVariantProps } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useCampaigns } from "@/hooks/useCampaigns";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import { ViewContactsDialog } from "@/components/campaigns/view-contacts-dialog";
import { useDebounce } from "@/hooks/useDebounce";

const statusVariant = (status: string): BadgeVariantProps["variant"] => {
  switch (status) {
    case "sent": return "default";
    case "completed": return "default";
    case "sending": return "secondary";
    case "paused": return "outline";
    case "draft": return "outline";
    case "failed": return "destructive";
    default: return "outline";
  }
};

export default function CampaignsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [isViewContactsOpen, setIsViewContactsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{id: number, name: string} | null>(null);
  
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { campaigns, isLoading, pagination } = useCampaigns(page, 10, debouncedSearchTerm);

  const handleViewAnalytics = (campaignId: number) => {
    router.push(`/campaigns/${campaignId}/analytics`);
  };

  const handleEditCampaign = (campaignName: string) => {
    toast({ title: "Edit Campaign", description: `Opening editor for ${campaignName}. (Not implemented)` });
  };

  const handleViewContacts = (campaign: {id: number, name: string}) => {
    setSelectedCampaign(campaign);
    setIsViewContactsOpen(true);
  };

  if (isLoading || !campaigns) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contacts</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <ViewContactsDialog 
        isOpen={isViewContactsOpen}
        onOpenChange={setIsViewContactsOpen}
        campaignId={selectedCampaign?.id || null}
        campaignName={selectedCampaign?.name || null}
      />
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
            <Input 
              placeholder="Search campaigns..." 
              className="max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filters</Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(campaigns || []).map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" className="p-0" onClick={() => handleViewContacts(campaign)}>
                        {campaign.contactCount}
                      </Button>
                    </TableCell>
                    <TableCell>{format(new Date(campaign.createdAt), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewAnalytics(campaign.id)}>View Analytics</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign.name)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
          </div>
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
    </div>
  );
}
