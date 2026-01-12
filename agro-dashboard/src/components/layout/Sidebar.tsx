// "use client";

// // =============================================================================
// // SIDEBAR - Menu lateral do dashboard
// // =============================================================================

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Home,
//   Map,
//   Cloud,
//   Bug,
//   BarChart3,
//   Bell,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   Leaf,
//   Droplets,
//   Users,
// } from "lucide-react";
// import { cn } from "../../lib/utils";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../..//components/ui/tooltip";

// // =============================================================================
// // TYPES
// // =============================================================================

// interface MenuItem {
//   title: string;
//   path: string;
//   icon: React.ElementType;
// }

// interface SidebarProps {
//   className?: string;
// }

// // =============================================================================
// // MENU ITEMS
// // =============================================================================

// const menuItems: MenuItem[] = [
//   { title: "Dashboard", path: "/dashboard", icon: BarChart3 },
//   { title: "Fazendas", path: "/dashboard/fazendas", icon: Home },
//   { title: "Mapas", path: "/dashboard/mapas", icon: Map },
//   { title: "Clima", path: "/dashboard/clima", icon: Cloud },
//   { title: "Pragas", path: "/dashboard/pragas", icon: Bug },
//   { title: "Produtividade", path: "/dashboard/produtividade", icon: Leaf },
//   { title: "Irrigação", path: "/dashboard/irrigacao", icon: Droplets },
//   { title: "Notificações", path: "/dashboard/notificacoes", icon: Bell },
// ];

// const adminMenuItems: MenuItem[] = [
//   { title: "Usuários", path: "/dashboard/admin/usuarios", icon: Users },
//   { title: "Configurações", path: "/dashboard/admin/configuracoes", icon: Settings },
// ];

// // =============================================================================
// // SIDEBAR ITEM COMPONENT
// // =============================================================================

// interface SidebarItemProps {
//   item: MenuItem;
//   isActive: boolean;
//   isCollapsed: boolean;
// }

// function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
//   const Icon = item.icon;

//   const content = (
//     <Link
//       href={item.path}
//       className={cn(
//         "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
//         "hover:bg-accent hover:text-accent-foreground",
//         isActive && "bg-accent text-accent-foreground font-medium"
//       )}
//     >
//       <Icon className="h-5 w-5 shrink-0" />
//       {!isCollapsed && <span>{item.title}</span>}
//     </Link>
//   );

//   if (isCollapsed) {
//     return (
//       <Tooltip delayDuration={0}>
//         <TooltipTrigger asChild>{content}</TooltipTrigger>
//         <TooltipContent side="right" className="font-medium">
//           {item.title}
//         </TooltipContent>
//       </Tooltip>
//     );
//   }

//   return content;
// }

// // =============================================================================
// // SIDEBAR COMPONENT
// // =============================================================================

// export default function Sidebar({ className }: SidebarProps) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const pathname = usePathname();

//   return (
//     <TooltipProvider>
//       <aside
//         className={cn(
//           "flex flex-col h-full bg-card border-r transition-all duration-300",
//           isCollapsed ? "w-16" : "w-64",
//           className
//         )}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           {!isCollapsed && (
//             <h2 className="text-lg font-bold text-primary">AgroIA</h2>
//           )}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="p-1.5 rounded-lg hover:bg-accent transition-colors"
//             aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
//           >
//             {isCollapsed ? (
//               <ChevronRight className="h-5 w-5" />
//             ) : (
//               <ChevronLeft className="h-5 w-5" />
//             )}
//           </button>
//         </div>

//         {/* Menu Principal */}
//         <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
//           {menuItems.map((item) => (
//             <SidebarItem
//               key={item.path}
//               item={item}
//               isActive={pathname === item.path}
//               isCollapsed={isCollapsed}
//             />
//           ))}

//           {/* Separador Admin */}
//           <div className="my-4 border-t" />

//           {!isCollapsed && (
//             <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
//               Admin
//             </p>
//           )}

//           {adminMenuItems.map((item) => (
//             <SidebarItem
//               key={item.path}
//               item={item}
//               isActive={pathname === item.path}
//               isCollapsed={isCollapsed}
//             />
//           ))}
//         </nav>

//         {/* Footer */}
//         <div className="p-4 border-t">
//           {!isCollapsed && (
//             <p className="text-xs text-muted-foreground text-center">
//               © 2025 AgroIA
//             </p>
//           )}
//         </div>
//       </aside>
//     </TooltipProvider>
//   );
// }

// // Export nomeado para compatibilidade
// export { Sidebar };















"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Map,
  Cloud,
  Bug,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Users,
  Leaf,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Fazendas", path: "/dashboard/fazendas", icon: Home },
  { title: "Mapas", path: "/dashboard/mapas", icon: Map },
  { title: "Clima", path: "/dashboard/clima", icon: Cloud },
  { title: "Pragas", path: "/dashboard/pragas", icon: Bug },
  { title: "Produtividade", path: "/dashboard/produtividade", icon: BarChart3 },
  { title: "Irrigação", path: "/dashboard/irrigacao", icon: Droplets },
  { title: "Notificações", path: "/dashboard/notificacoes", icon: Bell },
];

const adminMenuItems: MenuItem[] = [
  { title: "Usuários", path: "/dashboard/admin/usuarios", icon: Users },
  { title: "Configurações", path: "/dashboard/admin/configuracoes", icon: Settings },
];

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
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-primary text-primary-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="font-medium">{item.title}</span>}
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

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-border",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AgroIA</span>
            </div>
          )}
          {isCollapsed && (
            <div className="p-1.5 rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1.5 rounded-lg hover:bg-accent transition-colors",
              isCollapsed && "absolute -right-3 top-6 bg-card border shadow-sm"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Menu
            </p>
          )}
          
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isCollapsed={isCollapsed}
            />
          ))}

          <div className="my-4 border-t border-border" />

          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Admin
            </p>
          )}

          {adminMenuItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={pathname === item.path || pathname.startsWith(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className={cn("p-4 border-t border-border", isCollapsed && "p-2")}>
          {!isCollapsed ? (
            <div className="px-3 py-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">© 2025 AgroIA</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

export { Sidebar };