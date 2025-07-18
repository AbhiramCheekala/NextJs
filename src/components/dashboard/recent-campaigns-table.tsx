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

const campaigns = [
  { id: 'CAM001', name: 'Spring Promo 2024', status: 'Completed', leads: 1250, successRate: '85%', owner: 'Alice B.', link: '/campaigns/CAM001' },
  { id: 'CAM002', name: 'New Product Launch', status: 'Active', leads: 800, successRate: 'N/A', owner: 'Bob C.', link: '/campaigns/CAM002' },
  { id: 'CAM003', name: 'Holiday Discount', status: 'Scheduled', leads: 2500, successRate: 'N/A', owner: 'Carol D.', link: '/campaigns/CAM003' },
  { id: 'CAM004', name: 'Feedback Collection', status: 'Paused', leads: 500, successRate: '60% (partial)', owner: 'David E.', link: '/campaigns/CAM004' },
  { id: 'CAM005', name: 'Webinar Reminder', status: 'Completed', leads: 350, successRate: '92%', owner: 'Alice B.', link: '/campaigns/CAM005' },
];

const statusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'default';
    case 'active': return 'secondary'; // Or a custom "success" or "active" variant
    case 'scheduled': return 'outline';
    case 'paused': return 'destructive'; // Or a custom "warning" variant
    default: return 'default';
  }
}

export function RecentCampaignsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Campaigns</CardTitle>
        <CardDescription>Overview of your latest marketing campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(campaign.status) as any}>{campaign.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{campaign.leads.toLocaleString()}</TableCell>
                <TableCell className="text-right">{campaign.successRate}</TableCell>
                <TableCell>{campaign.owner}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={campaign.link}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
