import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, FileText, Send, MailOpen, BarChartBig, Users2, MessageSquare, Settings, ShieldAlert } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  roles?: string[];
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Send,
    roles: ['admin'],
  },
  {
    title: 'Live Outbox',
    href: '/outbox',
    icon: MailOpen,
    roles: ['admin'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChartBig,
    roles: ['admin'],
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users2,
    roles: ['admin'],
  },
  {
    title: 'Chats',
    href: '/chats',
    icon: MessageSquare,
    roles: ['admin', 'member'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

export const siteConfig = {
  name: "WhatsApp Command Center",
  description: "Manage your WhatsApp marketing campaigns efficiently.",
};
