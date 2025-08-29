"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BookCopy, ChevronsRight, Menu } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", icon: Home, label: "Check Queue" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/mappings", icon: BookCopy, label: "Mappings" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const SidebarLogo = () => (
    <div className="flex items-center gap-2 p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-primary"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l-4 4z" />
      </svg>
      <span className="text-lg font-semibold text-foreground">CheckMapper</span>
    </div>
  );

  const NavMenu = () => (
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
  );

  return (
    <div className="min-h-screen w-full bg-muted/40">
      <SidebarProvider>
        <Sidebar collapsible="icon" className="hidden md:flex">
          <SidebarHeader>
            <SidebarLogo />
          </SidebarHeader>
          <SidebarContent>
            <NavMenu />
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
           <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <div className="flex h-full max-h-screen flex-col gap-2">
                        <div className="flex h-[60px] items-center border-b px-6">
                            <SidebarLogo />
                        </div>
                        <div className="flex-1 overflow-auto py-2">
                           <NavMenu />
                        </div>
                    </div>
                </SheetContent>
              </Sheet>
            </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
