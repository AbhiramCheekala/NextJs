import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';

const errors = [
  { id: 'ERR001', timestamp: '2024-07-28 10:15:23', message: 'Rate limit exceeded (Code: 80007)', campaign: 'Summer Sale Q3', contactId: 'CID0987' },
  { id: 'ERR002', timestamp: '2024-07-28 10:05:10', message: 'Invalid phone number (Code: 131026)', campaign: 'New Arrivals Vol.2', contactId: 'CID1234' },
  { id: 'ERR003', timestamp: '2024-07-28 09:55:45', message: 'Template not approved (Code: 132015)', campaign: 'Holiday Special', contactId: 'CID5678' },
  { id: 'ERR004', timestamp: '2024-07-28 09:40:02', message: 'Message too long (Code: 132000)', campaign: 'Summer Sale Q3', contactId: 'CID2468' },
  { id: 'ERR005', timestamp: '2024-07-28 09:30:11', message: 'Recipient opted out (Code: 131051)', campaign: 'New Arrivals Vol.2', contactId: 'CID1357' },
];

export function ErrorFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
          Error Feed
        </CardTitle>
        <CardDescription>Last 50 message failures with reason codes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {errors.map((error) => (
              <div key={error.id} className="p-3 border rounded-md bg-destructive/10 border-destructive/30">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-destructive font-semibold">{error.message}</span>
                  <span className="text-xs text-muted-foreground">{error.timestamp}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Campaign: <Badge variant="outline" className="text-xs">{error.campaign}</Badge> | Contact: {error.contactId}
                </div>
              </div>
            ))}
            {errors.length === 0 && <p className="text-sm text-muted-foreground">No errors reported recently.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
