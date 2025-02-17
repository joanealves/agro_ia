'use client';

import { NotificationBadge } from '@/components/notifications/notification-badge';
import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

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