'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface MessageStatusData {
  status: string;
  count: number;
}

interface MessagesFlowChartProps {
  data: MessageStatusData[];
}

export function MessagesFlowChart({ data = [] }: MessagesFlowChartProps) {
  const chartData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    count: item.count,
  }));

  const chartConfig = {
    count: { label: 'Messages', color: 'hsl(var(--chart-1))' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Message Status Breakdown</CardTitle>
        <CardDescription>Total outgoing messages by status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Legend content={<ChartLegendContent />} />
            <Bar dataKey="count" fill={chartConfig.count.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
