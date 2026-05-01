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
import { toast } from "sonner";
export function AppSidebar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);
  const handleLogout = () => {
    logout();
    toast.info("Logout realizado com sucesso.");
    navigate("/");
  };
  const isAdmin = user?.role && ['admin', 'pastor', 'staff'].includes(user.role);
  const adminNavItems = [
    { title: "Dashboard", icon: Home, url: "/admin" },
    { title: "Membros", icon: Users, url: "/admin/members" },
    { title: "Cargos", icon: Briefcase, url: "/admin/positions" },
    { title: "Ministérios", icon: Heart, url: "/admin/ministries" },
    { title: "Atividades", icon: ListTodo, url: "/admin/activities" },
    { title: "Agenda", icon: Calendar, url: "/admin/events" },
    { title: "Financeiro", icon: Banknote, url: "/admin/finance" },
    { title: "Relatórios", icon: FileBarChart, url: "/admin/reports" },
  ];
  const memberNavItems = [
    { title: "Meu Dashboard", icon: Home, url: "/member/dashboard" },
    { title: "Agenda", icon: Calendar, url: "/admin/events" },
    { title: "Contribuições", icon: Wallet, url: "/member/donations" },
  ];
  const navItems = isAdmin ? adminNavItems : memberNavItems;
  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarHeader className="h-16 flex items-center px-4">
        <Link to={isAdmin ? "/admin" : "/member/dashboard"} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden text-foreground">ChurchFlow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {isAdmin ? "Administração" : "Painel do Membro"}
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
        <div className="px-6 py-2 text-[10px] text-muted-foreground/40 font-mono tracking-tighter">
          v1.1.0-pos
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-12 w-full justify-start gap-3 p-2 hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "CF"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden overflow-hidden flex-1">
                <span className="text-sm font-medium truncate text-foreground">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate capitalize">{user?.role}</span>
              </div>
              <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuItem asChild>
              <Link to={isAdmin ? "/admin/profile" : "/member/profile"}>Meu Perfil</Link>
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