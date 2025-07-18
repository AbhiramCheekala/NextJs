
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, PlayCircle, CalendarPlus, Users, ListFilter } from "lucide-react";
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

const mockCampaigns = [
  { id: "CAMP001", name: "Summer Sale Blast", template: "Summer Promo Template", audience: "Leads, Prospects", status: "Sent", sentOn: "2024-07-25", openRate: "25%" },
  { id: "CAMP002", name: "New Arrivals Teaser", template: "New Product Alert", audience: "VIP Customers", status: "Scheduled", scheduledFor: "2024-08-01", openRate: "N/A" },
  { id: "CAMP003", name: "Feedback Request", template: "Post-Purchase Survey", audience: "Recent Buyers", status: "Draft", sentOn: "N/A", openRate: "N/A" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "Sent": return "default";
    case "Scheduled": return "secondary";
    case "Draft": return "outline";
    default: return "outline";
  }
};

export default function CampaignsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleViewAnalytics = (campaignName: string) => {
    // In a real app, navigate to a specific analytics page for this campaign
    // router.push(`/analytics?campaignId=${campaignId}`);
    toast({ title: "View Analytics", description: `Navigating to analytics for ${campaignName}. (Not implemented)` });
  };

  const handleEditCampaign = (campaignName: string) => {
     // In a real app, navigate to an edit page or open an edit dialog
    // router.push(`/campaigns/${campaignId}/edit`);
    toast({ title: "Edit Campaign", description: `Opening editor for ${campaignName}. (Not implemented)` });
  };
  
  const handleSuggestCopy = () => {
    toast({ title: "Suggest Copy", description: `AI suggesting copy variations. (Not implemented)` });
  };

  const handleSegmentAudience = () => {
    toast({ title: "Segment Audience", description: `AI segmenting audience. (Not implemented)` });
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
            Create, schedule, and manage your WhatsApp campaigns. AI can suggest copy, best send times, and A/B variants.
          </CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <Input placeholder="Search campaigns..." className="max-w-sm" />
            <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filters</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.template}</TableCell>
                  <TableCell>{campaign.audience}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(campaign.status) as any}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.status === "Scheduled" ? campaign.scheduledFor : campaign.sentOn}</TableCell>
                  <TableCell>{campaign.openRate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewAnalytics(campaign.name)}>View Analytics</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign.name)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-center text-muted-foreground mt-6">
            Campaign wizard (template → audience tags → send/schedule), AI copy suggestions, best time recommendations, and A/B testing variants will be implemented here.
          </p>
        </CardContent>
      </Card>

      {/* AI Feature Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Wand2 className="mr-2 h-5 w-5 text-primary" /> AI Campaign Assistant</CardTitle>
          <CardDescription>Leverage AI to optimize your campaigns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Suggest Copy Variations</h3>
            <p className="text-sm text-muted-foreground mb-2">Generate multiple message options for your chosen template.</p>
            <Button variant="outline" onClick={handleSuggestCopy}>Suggest Copy</Button>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Segment Audience</h3>
            <p className="text-sm text-muted-foreground mb-2">Identify the best contacts for your campaign goal.</p>
            <Button variant="outline" onClick={handleSegmentAudience}>Segment Audience</Button>
          </div>
           <div>
            <h3 className="font-semibold mb-1">Optimal Send Time (Coming Soon)</h3>
            <p className="text-sm text-muted-foreground mb-2">AI will recommend the best time to send your campaign for maximum engagement.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
