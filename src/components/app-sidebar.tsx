import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  ChevronUp,
  Banknote,
  Calendar,
  FileBarChart,
  ListTodo,
  Wallet,
  Briefcase
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { canAccess, Resource } from "@/lib/perms";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
export function AppSidebar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);
  const ministryMembers = useDataStore(s => s.ministryMembers);
  const handleLogout = () => {
    logout();
    toast.info("Logout realizado com sucesso.");
    navigate("/");
  };
  const isAdminOrPrivileged = user?.role && ['admin', 'pastor', 'staff', 'leader'].includes(user.role);
  const allNavItems = [
    { title: "Dashboard", icon: Home, url: "/admin", resource: 'dashboard' as Resource },
    { title: "Membros", icon: Users, url: "/admin/members", resource: 'members' as Resource },
    { title: "Cargos", icon: Briefcase, url: "/admin/positions", resource: 'positions' as Resource },
    { title: "Ministérios", icon: Heart, url: "/admin/ministries", resource: 'ministries' as Resource },
    { title: "Atividades", icon: ListTodo, url: "/admin/activities", resource: 'activities' as Resource },
    { title: "Agenda", icon: Calendar, url: "/admin/events", resource: 'events' as Resource },
    { title: "Financeiro", icon: Banknote, url: "/admin/finance", resource: 'finance' as Resource },
    { title: "Relatórios", icon: FileBarChart, url: "/admin/reports", resource: 'reports' as Resource },
  ];
  const memberNavItems = [
    { title: "Meu Dashboard", icon: Home, url: "/member/dashboard" },
    { title: "Agenda", icon: Calendar, url: "/admin/events" },
    { title: "Contribuições", icon: Wallet, url: "/member/donations" },
  ];
  const navItems = isAdminOrPrivileged
    ? allNavItems.filter(item => canAccess(user, ministryMembers, item.resource))
    : memberNavItems;
  const isLeader = ministryMembers.some(mm => mm.memberId === user?.memberId && mm.role === 'leader');
  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarHeader className="h-16 flex items-center px-4">
        <Link to={isAdminOrPrivileged ? "/admin" : "/member/dashboard"} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden text-foreground text-nowrap">ChurchFlow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {isAdminOrPrivileged ? "Administração" : "Painel do Membro"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Configurações">
                <Settings />
                <span>Configurações</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-12 w-full justify-start gap-3 p-2 hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "CF"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden overflow-hidden flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate text-foreground">{user?.name}</span>
                  {(user?.role === 'leader' || isLeader) && (
                    <Badge variant="outline" className="h-4 px-1 text-[8px] uppercase border-blue-200 text-blue-600">Líder</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate capitalize">{user?.role}</span>
              </div>
              <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuItem asChild>
              <Link to={isAdminOrPrivileged ? "/admin/profile" : "/member/profile"}>Meu Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}