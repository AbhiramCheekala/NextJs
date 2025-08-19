"use client";

import React from "react";
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
import router from "next/router";

interface AppLayoutProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

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
          <SidebarNav items={navItems} isCollapsed={isCollapsed && !isMobile} />
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          {isCollapsed && !isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                window.location.href = "/login"; // or use router.push if in a client component
              }}
            >
              <LogOut className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground"
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="md:hidden" />
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
  // Initialize state based on defaultCollapsed for consistent SSR and initial client render
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!defaultCollapsed);
  const [isClientRendered, setIsClientRendered] = React.useState(false);

  React.useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setIsClientRendered(true); // Mark that client-side hydration is done

    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1];

    if (cookieValue !== undefined) {
      // Update the state based on the cookie. This will trigger a re-render on the client.
      setIsSidebarOpen(cookieValue === "true");
    }
    // If no cookie, isSidebarOpen remains based on defaultCollapsed, which is fine.
  }, [defaultCollapsed]); // defaultCollapsed is part of initial state logic

  // For the initial render (both server and client before useEffect),
  // openState will be !defaultCollapsed.
  // After useEffect runs on the client, openState will be isSidebarOpen (potentially updated by cookie).
  const openState = isClientRendered ? isSidebarOpen : !defaultCollapsed;

  return (
    <SidebarProvider
      open={openState} // Control SidebarProvider's open state
      onOpenChange={setIsSidebarOpen} // Allow SidebarProvider to change AppLayout's state
    >
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
