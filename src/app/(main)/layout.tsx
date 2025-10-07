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
import {
  Github,
  PanelLeft,
} from 'lucide-react';
import { CygnisAILogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MainNav } from './components/main-nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, secondaryNavItems } from './components/nav-items';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <CygnisAILogo className="size-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold tracking-tight">
                Cygnis A1
              </h2>
              <p className="text-xs text-sidebar-foreground/70">Assistant</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="ghost" asChild className="justify-start gap-2">
            <Link href="https://github.com/firebase/studio" target='_blank'>
              <Github />
              <span className="group-data-[collapsible=icon]:hidden">
                GitHub
              </span>
            </Link>
          </Button>
        </SidebarFooter>
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
              {[...navItems, ...secondaryNavItems].find((item) => item.href === pathname)?.label ||
                'Cygnis A1'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
