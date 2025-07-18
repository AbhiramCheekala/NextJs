'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartData = [
  { time: '10:00', latency: 2.5 },
  { time: '10:05', latency: 1.8 },
  { time: '10:10', latency: 3.2 },
  { time: '10:15', latency: 1.5 },
  { time: '10:20', latency: 4.0 },
  { time: '10:25', latency: 2.2 },
  { time: '10:30', latency: 1.0 },
];

const chartConfig = {
  latency: { label: 'Latency (sec)', color: 'hsl(var(--chart-1))' },
};

export function QueueLatencyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Queue Latency</CardTitle>
        <CardDescription>Message queue processing latency in seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis unit="s" tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Legend content={<ChartLegendContent />} />
            <defs>
              <linearGradient id="fillLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.latency.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartConfig.latency.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="latency"
              stroke={chartConfig.latency.color}
              fill="url(#fillLatency)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
