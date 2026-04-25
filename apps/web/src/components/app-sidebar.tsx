import { Link } from '@tanstack/react-router';
import { GalleryVerticalEnd } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';

const navItems = [
  {
    title: 'Platform',
    items: [
      {
        title: 'Home',
        url: '/',
        activeOptions: {
          fuzzy: false,
        },
      },
      {
        title: 'Form Templates',
        url: '/form-templates',
        activeOptions: {
          fuzzy: true,
        },
      },
      {
        title: 'Projects',
        url: '/projects',
        activeOptions: {
          fuzzy: true,
        },
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">phanty</span>
                  <span className="">v0.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      activeOptions={{
                        exact: !item.activeOptions.fuzzy,
                        includeSearch: false,
                      }}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
