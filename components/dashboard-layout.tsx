"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { BarChart3, LayoutDashboard, MessageSquare, Search, Settings, HelpCircle, ShoppingCart, Candy } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import ScrollHeader from "./scroll-header"
import { ThinkingStickerAnimated } from "./thinking-sticker-animated"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

  // Internal component to handle sidebar state based on screen size
  function SidebarController( ) {
    const { setOpen } = useSidebar()
    const isLargeScreen = useMediaQuery("(min-width: 1280px)")
  

    useEffect(() => {

        setOpen(isLargeScreen);
      
    }, [isLargeScreen]);

    return null
  }

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "LLM Leaderboard",
      icon: MessageSquare,
      href: "/dashboard/compare",
    },
    {
      title: "Research",
      icon: Search,
      href: "/dashboard/research",
    },
    {
      title: "스토어(MCP)",
      icon: Candy,
      href: "/dashboard/store",
    },
     {
      title: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
  ]


  return (
    <SidebarProvider>
      <SidebarController/>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-primary-foreground">G</span>
              </div>
              <Link href="/">
              <span className="text-xl font-semibold tracking-tight">Gemini Chat</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => item.title=="스토어(MCP)" ? (
                     <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full justify-start dark:text-pink-300">
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) :( <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
}

                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/help">
                        <HelpCircle className="h-5 w-5" />
                        <span>Help & Documentation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                 <AvatarImage
                                  src="/cs-icon.png"   
                                  alt="CS"
                                />
                <AvatarFallback>CS</AvatarFallback>
              </Avatar>
                <div>
                  <p className="text-sm font-medium">Hugh Grant</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            <SidebarHeader className="border-b px-6 py-3">
              <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center">
                    <SidebarTrigger />
                  </div>
                  <span className="text-xl font-semibold tracking-tight"> {menuItems.find((item) => item.href === pathname)?.title || "Dashboard"}</span>
              </div>
            </SidebarHeader>

            <main className={`flex-1 overflow-auto p-6 w-full min-w-0`}>
                {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
