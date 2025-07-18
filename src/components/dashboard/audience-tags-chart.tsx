'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer, ChartLegendContent } from '@/components/ui/chart';

const chartData = [
  { name: 'Lead', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Positive', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Neutral', value: 150, fill: 'hsl(var(--chart-3))' },
  { name: 'Converted', value: 200, fill: 'hsl(var(--chart-4))' },
  { name: 'VIP', value: 100, fill: 'hsl(var(--chart-5))' },
];

const chartConfig = {
  value: { label: 'Contacts' },
  Lead: { label: 'Lead', color: 'hsl(var(--chart-1))' },
  Positive: { label: 'Positive', color: 'hsl(var(--chart-2))' },
  Neutral: { label: 'Neutral', color: 'hsl(var(--chart-3))' },
  Converted: { label: 'Converted', color: 'hsl(var(--chart-4))' },
  VIP: { label: 'VIP', color: 'hsl(var(--chart-5))' },
};


export function AudienceTagsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Audience Tags Distribution</CardTitle>
        <CardDescription>Distribution of tags in the current or recent campaign.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[400px]">
          <PieChart>
            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              labelLine={false}
              // label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend content={<ChartLegendContent nameKey="name"/>} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
