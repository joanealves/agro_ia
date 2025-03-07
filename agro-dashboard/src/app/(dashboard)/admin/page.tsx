'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role !== 'admin') router.push('/dashboard'); 
  }, [user, loading]);

  if (loading) return <p className="text-center text-foreground">Carregando...</p>;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {user && <Header user={user} onMenuClick={() => {}} />}
        <main className="p-6">
          <h1 className="text-3xl font-bold">Bem-vindo, Admin {user?.name}!</h1>
          <p className="mt-4">Este é o painel do administrador.</p>
        </main>
      </div>
    </div>
  );
}