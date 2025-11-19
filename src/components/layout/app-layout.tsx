"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { navItems, siteConfig } from "@/config/nav";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { UserNav } from "@/components/navigation/user-nav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Define hidden navigation items that are accessible but not displayed in the sidebar
  const hiddenNavItems = [
    { href: '/campaigns/new', roles: ['admin'] },
    { href: '/campaigns/new-bulk', roles: ['admin'] },
    { href: '/contacts/[id]', roles: ['admin'] },
    { href: '/team/add', roles: ['admin'] },
    { href: '/team/[id]', roles: ['admin'] },
  ];

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role);
    } else {
      router.push("/login");
    }
  }, [router]);

  const filteredNavItems = navItems.filter(
    (item) => item.roles?.includes(userRole || "")
  );

  useEffect(() => {
    if (userRole) {
      const currentPath = pathname;
      const isAuthorized =
        filteredNavItems.some((item) => item.href === currentPath) ||
        hiddenNavItems.some(
          (item) =>
            item.roles?.includes(userRole) &&
            (item.href === currentPath ||
              (item.href.includes('[id]') && currentPath.startsWith(item.href.split('[id]')[0])))
        );

      if (!isAuthorized) {
        if (userRole === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/chats");
        }
      }
    }
  }, [userRole, pathname, router, filteredNavItems, hiddenNavItems]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible={isMobile ? "offcanvas" : "icon"}
      >
        <SidebarHeader className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          <Logo className="h-7 w-7 text-primary" />
          {!isCollapsed && !isMobile && (
            <h1 className="font-headline text-lg font-semibold text-sidebar-foreground">
              {siteConfig.name}
            </h1>
          )}
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav
            items={filteredNavItems}
            isCollapsed={isCollapsed && !isMobile}
          />
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          {isCollapsed && !isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </>
  );
}

export function AppLayout({
  children,
  defaultCollapsed = false,
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!defaultCollapsed);
  const [isClientRendered, setIsClientRendered] = React.useState(false);

  React.useEffect(() => {
    setIsClientRendered(true);

    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1];

    if (cookieValue !== undefined) {
      setIsSidebarOpen(cookieValue === "true");
    }
  }, []);

  const openState = isClientRendered ? isSidebarOpen : !defaultCollapsed;

  return (
    <SidebarProvider
      open={openState}
      onOpenChange={setIsSidebarOpen}
    >
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
