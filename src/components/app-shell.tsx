import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import {
  Brain, LayoutDashboard, Building2, Zap, Package, Wrench, BarChart3,
  Settings, GraduationCap, Sun, Moon, LogOut, LogIn, Sparkles, TrendingUp, Megaphone, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const items = [
  { title: "Home", url: "/", icon: Sparkles },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];
const modules = [
  { title: "Infrastructure", url: "/infrastructure", icon: Building2 },
  { title: "Resources", url: "/resources", icon: Zap },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Admission Trends", url: "/admissions", icon: TrendingUp },
  { title: "Outreach & Growth", url: "/outreach", icon: Megaphone },
  { title: "Substitute Allocation", url: "/substitutes", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];
const extras = [
  { title: "Attendance", url: "/attendance", icon: GraduationCap },
  { title: "Settings", url: "/settings", icon: Settings },
];


function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isActive = (p: string) => path === p;

  const renderGroup = (label: string, list: typeof items) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {list.map((i) => (
            <SidebarMenuItem key={i.url}>
              <SidebarMenuButton asChild isActive={isActive(i.url)}>
                <Link to={i.url} className="flex items-center gap-2">
                  <i.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{i.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-bg text-white glow">
            <Brain className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">CPMS</p>
              <p className="truncate text-[10px] text-muted-foreground">Predictive AI</p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Overview", items)}
        {renderGroup("Modules", modules)}
        {renderGroup("More", extras)}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <p className="px-2 text-[10px] text-muted-foreground">v1.0 · AI Edition</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const nav = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b glass px-3 sm:px-5">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {user ? (
          <>
            <span className="hidden sm:inline text-xs text-muted-foreground max-w-[180px] truncate">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => nav({ to: "/auth" })} className="gradient-bg text-white">
            <LogIn className="h-4 w-4" /> Admin sign in
          </Button>
        )}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
