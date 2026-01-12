// import React from 'react';

// interface HeaderProps {
//   user: {
//     name: string;
//     username: string;
//   };
//   onMenuClick: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ user, onMenuClick }) => {
//   return (
//     <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
//       <h1 className="text-xl font-bold">Dashboard</h1>
//       <div className="flex items-center">
//         <span className="mr-4">Olá, {user.username}</span>
//         <button onClick={onMenuClick} className="p-2 bg-secondary rounded">
//           Menu
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Header;











"use client";

// =============================================================================
// HEADER - Cabeçalho do dashboard
// =============================================================================

import { useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Menu, Sun, Moon, LogOut, User, Settings } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { useAuth } from "../../app/providers/AuthProvider";
import { NotificationBadge } from "../../components/notifications/notification-badge";

// =============================================================================
// TYPES
// =============================================================================

interface HeaderProps {
  onMenuClick?: () => void;
}

// =============================================================================
// HEADER COMPONENT
// =============================================================================

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Menu Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo/Title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-xl">AgroIA Dashboard</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <NotificationBadge />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
