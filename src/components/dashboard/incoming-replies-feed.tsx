import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessagesSquare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

type Sentiment = 'positive' | 'neutral' | 'negative' | 'escalate';

const replies = [
  { id: 'REP001', user: 'Alice M.', avatar: 'https://placehold.co/40x40.png?text=AM', dataAiHint: 'user avatar', timestamp: '10:32 AM', message: 'Thanks for the update, sounds great!', sentiment: 'positive' as Sentiment, campaign: 'Summer Sale' },
  { id: 'REP002', user: 'Bob K.', avatar: 'https://placehold.co/40x40.png?text=BK', dataAiHint: 'user avatar', timestamp: '10:28 AM', message: 'Not interested, please remove me.', sentiment: 'negative' as Sentiment, campaign: 'New Arrivals' },
  { id: 'REP003', user: 'Charlie P.', avatar: 'https://placehold.co/40x40.png?text=CP', dataAiHint: 'user avatar', timestamp: '10:15 AM', message: 'Can I get more details on this?', sentiment: 'neutral' as Sentiment, campaign: 'Holiday Special' },
  { id: 'REP004', user: 'David S.', avatar: 'https://placehold.co/40x40.png?text=DS', dataAiHint: 'user avatar', timestamp: '10:05 AM', message: 'This is unacceptable! I demand a refund NOW!!', sentiment: 'escalate' as Sentiment, campaign: 'Summer Sale' },
  { id: 'REP005', user: 'Eve T.', avatar: 'https://placehold.co/40x40.png?text=ET', dataAiHint: 'user avatar', timestamp: '09:50 AM', message: 'Okay, I will check it out.', sentiment: 'neutral' as Sentiment, campaign: 'Feedback Collection' },
];

const sentimentColor = (sentiment: Sentiment) => {
  switch (sentiment) {
    case 'positive': return 'border-green-500 bg-green-500/10';
    case 'neutral': return 'border-blue-500 bg-blue-500/10';
    case 'negative': return 'border-orange-500 bg-orange-500/10';
    case 'escalate': return 'border-red-600 bg-red-600/20 font-semibold';
    default: return 'border-muted';
  }
};

export function IncomingRepliesFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <MessagesSquare className="mr-2 h-5 w-5 text-primary" />
          Incoming Replies
        </CardTitle>
        <CardDescription>Latest replies from your audience, sentiment-coded.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className={cn("flex items-start space-x-3 p-3 border rounded-md", sentimentColor(reply.sentiment))}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.avatar} alt={reply.user} data-ai-hint={reply.dataAiHint} />
                  <AvatarFallback>{reply.user.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{reply.user}</span>
                    <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{reply.message}</p>
                  <div className="text-xs mt-1">
                    <Badge variant="outline" className="mr-1 capitalize">{reply.sentiment}</Badge>
                    <Badge variant="secondary" className="text-xs">{reply.campaign}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {replies.length === 0 && <p className="text-sm text-muted-foreground">No incoming replies yet.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
