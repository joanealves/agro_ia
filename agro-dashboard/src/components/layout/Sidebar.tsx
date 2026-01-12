// "use client";
// import { useState } from "react";
// import { Home, File, Map, Droplet, Bell, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// interface SidebarItemProps {
//   icon: React.ElementType;
//   text: string;
//   isOpen: boolean;
// }

// const SidebarItem = ({ icon: Icon, text, isOpen }: SidebarItemProps) => (
//   <Tooltip>
//     <TooltipTrigger asChild>
//       <div className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md cursor-pointer">
//         <Icon className="w-5 h-5 text-white" />
//         {isOpen && <span className="text-white">{text}</span>}
//       </div>
//     </TooltipTrigger>
//     {!isOpen && (
//       <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
//         {text}
//       </TooltipContent>
//     )}
//   </Tooltip>
// );

// const Sidebar = () => {
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div
//         className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? "w-60" : "w-16"} flex flex-col p-2`}
//       >
//         <button
//           className="mb-4 self-start p-2 rounded-md bg-gray-800 hover:bg-gray-700"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {isOpen ? <ChevronLeft /> : <ChevronRight />}
//         </button>

//         <TooltipProvider>
//           {/* Sidebar Items */}
//           <SidebarItem icon={Home} text="Pragas" isOpen={isOpen} />
//           <SidebarItem icon={File} text="Relatórios" isOpen={isOpen} />
//           <SidebarItem icon={Map} text="Mapas" isOpen={isOpen} />
//           <SidebarItem icon={Leaf} text="Fazendas" isOpen={isOpen} />
//           <SidebarItem icon={Droplet} text="Irrigações" isOpen={isOpen} />
//           <SidebarItem icon={Bell} text="Notificações" isOpen={isOpen} />
//         </TooltipProvider>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;















"use client";

// =============================================================================
// SIDEBAR - Menu lateral do dashboard
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  Cloud,
  Bug,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Droplets,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../..//components/ui/tooltip";

// =============================================================================
// TYPES
// =============================================================================

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarProps {
  className?: string;
}

// =============================================================================
// MENU ITEMS
// =============================================================================

const menuItems: MenuItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { title: "Fazendas", path: "/dashboard/fazendas", icon: Home },
  { title: "Mapas", path: "/dashboard/mapas", icon: Map },
  { title: "Clima", path: "/dashboard/clima", icon: Cloud },
  { title: "Pragas", path: "/dashboard/pragas", icon: Bug },
  { title: "Produtividade", path: "/dashboard/produtividade", icon: Leaf },
  { title: "Irrigação", path: "/dashboard/irrigacao", icon: Droplets },
  { title: "Notificações", path: "/dashboard/notificacoes", icon: Bell },
];

const adminMenuItems: MenuItem[] = [
  { title: "Usuários", path: "/dashboard/admin/usuarios", icon: Users },
  { title: "Configurações", path: "/dashboard/admin/configuracoes", icon: Settings },
];

// =============================================================================
// SIDEBAR ITEM COMPONENT
// =============================================================================

interface SidebarItemProps {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.path}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col h-full bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-primary">AgroIA</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu Principal */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isCollapsed={isCollapsed}
            />
          ))}

          {/* Separador Admin */}
          <div className="my-4 border-t" />

          {!isCollapsed && (
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Admin
            </p>
          )}

          {adminMenuItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground text-center">
              © 2025 AgroIA
            </p>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

// Export nomeado para compatibilidade
export { Sidebar };