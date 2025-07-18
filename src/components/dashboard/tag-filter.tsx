'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Tags } from 'lucide-react';

const availableTags = [
  { value: 'all', label: 'All Tags' },
  { value: 'lead', label: 'Lead' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'converted', label: 'Converted' },
  { value: 'promo_q1', label: 'Promo Q1' },
  { value: 'newsletter', label: 'Newsletter Subscribers' },
];

export function TagFilter() {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="w-[200px]">
        <Tags className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Filter by tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Filter by Tag</SelectLabel>
          {availableTags.map((tag) => (
            <SelectItem key={tag.value} value={tag.value}>
              {tag.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
