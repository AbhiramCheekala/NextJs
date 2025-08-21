import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '../ui/button';
import { RecentCampaign } from '@/hooks/useDashboard';
import { format } from 'date-fns';

interface RecentCampaignsTableProps {
  campaigns: RecentCampaign[];
}

const statusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'sent': return 'default';
    case 'sending': return 'secondary';
    case 'draft': return 'outline';
    case 'failed': return 'destructive';
    default: return 'outline';
  }
}

export function RecentCampaignsTable({ campaigns }: RecentCampaignsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Campaigns</CardTitle>
        <CardDescription>An overview of your 5 most recent campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
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
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  You haven't sent any campaigns yet.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(campaign.status) as any}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(campaign.createdAt), "PPP")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/${campaign.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
