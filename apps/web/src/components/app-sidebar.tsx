'use client';

import {
  BotIcon,
  SendIcon,
  Settings2Icon,
  TerminalIcon,
  TerminalSquareIcon,
} from 'lucide-react';
import type * as React from 'react';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authData = useAuth();

  const data = {
    user: {
      name: authData.user.name,
      email: authData.user.email,
      avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
      {
        title: 'Projects',
        url: '#',
        icon: <TerminalSquareIcon />,
        isActive: true,
      },
      {
        title: 'Processors',
        url: '#',
        icon: <BotIcon />,
      },
    ],
    navSecondary: [
      {
        title: 'Settings',
        url: '#',
        icon: <Settings2Icon />,
      },
      {
        title: 'Feedback',
        url: '#',
        icon: <SendIcon />,
      },
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
