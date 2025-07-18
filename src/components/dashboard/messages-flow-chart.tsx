'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartData = [
  { hour: '00:00', sent: 400, delivered: 380, read: 240 },
  { hour: '01:00', sent: 300, delivered: 280, read: 139 },
  { hour: '02:00', sent: 200, delivered: 190, read: 180 },
  { hour: '03:00', sent: 278, delivered: 260, read: 190 },
  { hour: '04:00', sent: 189, delivered: 180, read: 150 },
  { hour: '05:00', sent: 239, delivered: 220, read: 180 },
  { hour: '06:00', sent: 349, delivered: 330, read: 210 },
  { hour: '07:00', sent: 450, delivered: 430, read: 280 },
  { hour: '08:00', sent: 500, delivered: 480, read: 350 },
  { hour: '09:00', sent: 480, delivered: 460, read: 320 },
  { hour: '10:00', sent: 400, delivered: 380, read: 290 },
  { hour: '11:00', sent: 350, delivered: 330, read: 250 },
];

const chartConfig = {
  sent: { label: 'Sent', color: 'hsl(var(--chart-1))' },
  delivered: { label: 'Delivered', color: 'hsl(var(--chart-2))' },
  read: { label: 'Read', color: 'hsl(var(--chart-3))' },
};

export function MessagesFlowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Message Funnel (Hourly)</CardTitle>
        <CardDescription>Sent → Delivered → Read trend for the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Legend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="sent" stroke={chartConfig.sent.color} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="delivered" stroke={chartConfig.delivered.color} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="read" stroke={chartConfig.read.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
