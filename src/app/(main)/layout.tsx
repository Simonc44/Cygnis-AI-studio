'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { PanelLeft } from 'lucide-react';
import { CygnisAILogo } from '@/components/icons';
import { MainNav } from './components/main-nav';
import { usePathname } from 'next/navigation';
import { navItems, secondaryNavItems } from './components/nav-items';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const allNavItems = [...navItems, ...secondaryNavItems];
    const currentItem = allNavItems.find(
      (item) => pathname.startsWith(item.href) && item.href !== '/'
    );
    if (pathname === '/') return 'Playground';
    return currentItem?.label || 'Cygnis AI';
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <CygnisAILogo className="size-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold tracking-tight">
                Cygnis AI Studio
              </h2>
              <p className="text-xs text-sidebar-foreground/70">Model: Cygnis A1</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4"></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className="md:hidden">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
          </div>
          <div className="flex-1">
            <h1 className="font-headline text-xl font-semibold">
              {getPageTitle()}
            </h1>
          </div>
        </header>
        <main className="flex h-[calc(100vh-3.5rem)] flex-col bg-muted/20">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
