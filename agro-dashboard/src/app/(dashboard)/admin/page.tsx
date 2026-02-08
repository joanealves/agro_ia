// 'use client';

// import { useAuth } from "../../../app/providers/AuthProvider";
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import Sidebar from '../../../components/layout/Sidebar';
// import Header from '../../../components/layout/Header';

// export default function AdminPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) router.push('/login');
//     if (!loading && user?.role !== 'admin') router.push('/dashboard'); 
//   }, [user, loading]);

//   if (loading) return <p className="text-center text-foreground">Carregando...</p>;

//   return (
//     <div className="flex h-screen bg-background text-foreground">
//       <Sidebar />
//       <div className="flex-1 overflow-y-auto">
//         {user && <Header user={user} onMenuClick={() => {}} />}
//         <main className="p-6">
//           <h1 className="text-3xl font-bold">Bem-vindo, Admin {user?.name}!</h1>
//           <p className="mt-4">Este é o painel do administrador.</p>
//         </main>
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useAuth } from "../../../app/providers/AuthProvider";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import Sidebar from "../../../components/layout/Sidebar";
// import Header from "../../../components/layout/Header";

// export default function AdminPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) router.push("/login");
//     if (!loading && user?.role !== "admin") router.push("/dashboard");
//   }, [user, loading, router]);

//   if (loading) return <p className="text-center text-foreground">Carregando...</p>;

//   return (
//     <div className="flex h-screen bg-background text-foreground">
//       <Sidebar />
//       <div className="flex-1 overflow-y-auto">
//         <Header onMenuClick={() => {}} />

//         <main className="p-6">
//           <h1 className="text-3xl font-bold">Bem-vindo, Admin {user?.name}!</h1>
//           <p className="mt-4">Este é o painel do administrador.</p>
//         </main>
//       </div>
//     </div>
//   );
// }












"use client";

// =============================================================================
// ADMIN PAGE - Painel do administrador
// =============================================================================
// ⚠️ IMPORTANTE: Esta página NÃO deve renderizar Sidebar nem Header!
// O DashboardLayout (layout.tsx) já inclui o MainLayout que renderiza ambos.
// Esta página deve conter APENAS o conteúdo interno.
// =============================================================================

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Users, Settings, Shield, Activity } from "lucide-react";
import Link from "next/link";

// =============================================================================
// ADMIN PAGE COMPONENT
// =============================================================================

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteção de rota - só admin pode acessar
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Loading enquanto verifica permissões
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  // Se não for admin, não renderiza (vai redirecionar)
  if (user?.role !== "admin") {
    return null;
  }

  // =========================================================================
  // RENDER - Apenas o conteúdo, SEM Sidebar/Header
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo, {user?.name}! Gerencie o sistema AgroIA.
        </p>
      </div>

      {/* Cards de navegação admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usuários */}
        <Link href="/dashboard/admin/usuarios">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Gerenciar usuários do sistema
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Configurações */}
        <Link href="/dashboard/admin/configuracoes">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Configurações</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configurações gerais do sistema
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Permissões */}
        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Permissões</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Em breve
            </p>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Em breve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações do sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Ambiente</span>
              <span className="font-medium">Desenvolvimento</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Usuário logado</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}