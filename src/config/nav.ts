import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, Send, MailOpen, BarChartBig, Users2, MessageSquare, Settings, ShieldAlert } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: FileText,
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Send,
  },
  {
    title: 'Live Outbox',
    href: '/outbox',
    icon: MailOpen,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChartBig,
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users2,
  },
  {
    title: 'Chats',
    href: '/chats',
    icon: MessageSquare,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const siteConfig = {
  name: "WhatsApp Command Center",
  description: "Manage your WhatsApp marketing campaigns efficiently.",
};
