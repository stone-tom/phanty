'use client';

import {
  BotIcon,
  SendIcon,
  Settings2Icon,
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth';
import { TeamSwitcher } from './team-switcher';
import { Skeleton } from './ui/skeleton';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authData = useAuth();
  const { data: organizations } = authClient.useListOrganizations();

  const data = {
    user: {
      name: authData.user.name,
      email: authData.user.email,
      avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
      {
        title: 'Projects',
        url: '/projects',
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
        {organizations ? (
          <TeamSwitcher teams={organizations} />
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
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
