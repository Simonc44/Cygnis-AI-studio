'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Bot,
  KeyRound,
  BookText,
  BarChart3,
  Github,
  PanelLeft,
} from 'lucide-react';
import { CygnisAILogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Playground', icon: Bot },
  { href: '/api-keys', label: 'API Keys', icon: KeyRound },
  { href: '/documentation', label: 'Documentation', icon: BookText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

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
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="ghost" asChild className="justify-start gap-2">
            <Link href="#">
              <Github />
              <span className="group-data-[collapsible=icon]:hidden">
                GitHub
              </span>
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 md:px-6">
          <div className="md:hidden">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
          </div>
          <div className="flex-1">
            <h1 className="font-headline text-xl font-semibold">
              {navItems.find((item) => item.href === pathname)?.label ||
                'Cygnis A1'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
