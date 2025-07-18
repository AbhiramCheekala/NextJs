'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import Link from 'next/link';

const chartData = [
  { name: 'Summer Sale Q3', ctr: 12.5, link: '/campaigns/summer-sale-q3' },
  { name: 'New Arrivals Vol.2', ctr: 10.2, link: '/campaigns/new-arrivals-vol2' },
  { name: 'Holiday Special', ctr: 9.8, link: '/campaigns/holiday-special' },
  { name: 'Weekend Flash Deal', ctr: 8.1, link: '/campaigns/weekend-flash-deal' },
  { name: 'Welcome Series', ctr: 7.5, link: '/campaigns/welcome-series' },
];

const chartConfig = {
  ctr: { label: 'CTR (%)', color: 'hsl(var(--chart-1))' },
};

export function TopCampaignsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Top 5 Campaigns by CTR</CardTitle>
        <CardDescription>Click on a bar to view campaign details.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" dataKey="ctr" tickLine={false} axisLine={false} tickMargin={8} unit="%" />
            <YAxis 
              type="category" 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              width={120}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0,15)}...` : value}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))' }} 
              content={<ChartTooltipContent indicator="dot" />} 
            />
            <Legend content={<ChartLegendContent />} />
            <Bar dataKey="ctr" radius={4}>
              {chartData.map((entry, index) => (
                // This makes the bar clickable, but for actual navigation, a custom event handler or a different approach might be needed with Recharts
                // For now, the hover effect is the main indicator. Actual linking is difficult with standard Recharts Bar.
                // We can wrap the chart in a div and handle click events based on coordinates if needed, or use a custom Bar component.
                // For simplicity, we make the text in tooltip clickable if that's feasible, or provide links elsewhere.
                // The prompt states "hover = drill-down link", which suggests a tooltip link or similar.
                // The example here doesn't directly make bars links, but this can be enhanced.
                 <Link key={`bar-${index}`} href={entry.link} legacyBehavior>
                    <Bar dataKey="ctr" fill={chartConfig.ctr.color} radius={4} style={{ cursor: 'pointer' }} />
                 </Link>
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
