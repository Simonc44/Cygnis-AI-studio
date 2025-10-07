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
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/', label: 'Playground', icon: Bot },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const secondaryNavItems = [
    { href: '/api-keys', label: 'API Keys', icon: KeyRound },
    { href: '/documentation', label: 'Documentation', icon: BookText },
]

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
          <Separator className="my-2" />
           <SidebarMenu>
            {secondaryNavItems.map((item) => (
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
