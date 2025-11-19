import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessagesSquare } from 'lucide-react';
import { IncomingReply } from '@/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface IncomingRepliesFeedProps {
  replies: IncomingReply[];
}

export function IncomingRepliesFeed({ replies }: IncomingRepliesFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <MessagesSquare className="mr-2 h-5 w-5 text-primary" />
          Incoming Replies
        </CardTitle>
        <CardDescription>Latest replies from your audience.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {replies.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                No incoming replies yet.
              </div>
            ) : (
              replies.map((reply) => (
                <Link key={reply.id} href={`/chats?contact=${reply.contactId}`} passHref>
                  <div className="flex items-start space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{reply.contactName ? reply.contactName.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{reply.contactName || `Contact ${reply.contactId.substring(0, 6)}...`}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5">{reply.content}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
