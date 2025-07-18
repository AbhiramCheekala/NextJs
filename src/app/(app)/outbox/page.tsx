import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, RefreshCw, ListFilter } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const mockOutboxItems = [
  { id: "MSG001", campaign: "Summer Sale Blast", contact: "Alice (..890)", status: "Sent", timestamp: "10:35 AM" },
  { id: "MSG002", campaign: "Summer Sale Blast", contact: "Bob (..321)", status: "Delivered", timestamp: "10:36 AM" },
  { id: "MSG003", campaign: "Summer Sale Blast", contact: "Charlie (..567)", status: "Read", timestamp: "10:38 AM" },
  { id: "MSG004", campaign: "New Arrivals Teaser", contact: "David (..234)", status: "Queued", timestamp: "10:40 AM" },
  { id: "MSG005", campaign: "New Arrivals Teaser", contact: "Eve (..678)", status: "Failed", timestamp: "10:41 AM", reason: "Invalid Number" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "Sent": return "default";
    case "Delivered": return "secondary"; // Consider a 'success' like variant
    case "Read": return "default"; // Consider a 'info' like variant
    case "Queued": return "outline";
    case "Failed": return "destructive";
    default: return "outline";
  }
};

export default function LiveOutboxPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold">Live Outbox</h1>
        <div className="flex gap-2">
          <Button variant="outline"><PauseCircle className="mr-2 h-4 w-4" /> Pause All</Button>
          <Button><PlayCircle className="mr-2 h-4 w-4" /> Resume All</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress: Summer Sale Blast</CardTitle>
          <CardDescription>Real-time stream of message statuses for the active campaign.</CardDescription>
          <div className="pt-2">
            <Progress value={66} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">66% complete (1250 / 1875 messages processed)</p>
          </div>
           <div className="flex items-center gap-2 pt-4">
            <Input placeholder="Filter by contact or status..." className="max-w-sm" />
            <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filters</Button>
          </div>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOutboxItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.campaign}</TableCell>
                  <TableCell>{item.contact}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(item.status) as any}>
                      {item.status}
                    </Badge>
                    {item.status === "Failed" && <span className="text-xs text-destructive ml-1">({item.reason})</span>}
                  </TableCell>
                  <TableCell>{item.timestamp}</TableCell>
                  <TableCell className="text-right">
                    {item.status === "Failed" && (
                      <Button variant="outline" size="sm"><RefreshCw className="mr-1 h-3 w-3" /> Retry</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-center text-muted-foreground mt-6">Live outbox streaming campaign progress with retry and pause/resume capabilities will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
