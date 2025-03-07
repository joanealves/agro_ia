'use client';

import { NotificationBadge } from '@/components/notifications/notification-badge';
import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

interface HeaderProps {
  user: {
    name: string;
    username: string;
  };
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="flex items-center">
        <span className="mr-4">Olá, {user.username}</span>
        <button onClick={onMenuClick} className="p-2 bg-secondary rounded">
          Menu
        </button>
      </div>
    </header>
  );
};

export function DashboardHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AgroTech</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-accent rounded-md"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button className="p-2 hover:bg-accent rounded-md">
            <Bell className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary"></div>
        </div>
      </div>
      <NotificationBadge />
    </header>
  );
}

export default Header;