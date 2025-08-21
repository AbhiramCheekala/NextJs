import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ErrorFeedItem } from '@/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';

interface ErrorFeedProps {
  errors: ErrorFeedItem[];
}

export function ErrorFeed({ errors }: ErrorFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
          Error Feed
        </CardTitle>
        <CardDescription>Most recent message failures with reason codes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {errors.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                No errors to report.
              </div>
            ) : (
              errors.map((error) => (
                <div key={error.id} className="p-3 border rounded-md bg-destructive/10 border-destructive/30">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-destructive font-semibold">{error.error || 'Unknown error'}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Message: "{error.content.substring(0, 50)}..."
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
