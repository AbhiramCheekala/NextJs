'use client';

import { useTemplateKpis } from '@/hooks/useTemplateKPIs';
import { KpiCard } from './kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, TrendingUp, Send, XCircle } from 'lucide-react';

export function TemplateKpiCards() {
  const { kpis, isLoading } = useTemplateKpis();

  if (isLoading || !kpis) {
    return (
      <>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mt-6">Template Message Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-headline font-semibold tracking-tight mt-6">Template Message Stats</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Templates Sent" value={kpis.sent.toLocaleString()} icon={Send} />
        <KpiCard title="Templates Delivered" value={kpis.delivered.toLocaleString()} icon={CheckCircle2} />
        <KpiCard title="Templates Read" value={kpis.read.toLocaleString()} icon={TrendingUp} />
        <KpiCard title="Templates Failed" value={kpis.failed.toLocaleString()} icon={XCircle} changeType="negative" />
      </div>
    </>
  );
}
