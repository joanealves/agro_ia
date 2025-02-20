"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
      <div className="flex h-screen pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
