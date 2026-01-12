// "use client";

// import { useAuth } from "../../app/providers/AuthProvider";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace("/login");
//     }
//   }, [user, loading, router]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white">
//         Carregando sessão...
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white">
//         Redirecionando...
//       </div>
//     );
//   }

//   return <>{children}</>;
// }





"use client";

// =============================================================================
// DASHBOARD LAYOUT - Layout protegido para todas as rotas do dashboard
// =============================================================================

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/providers/AuthProvider";
import MainLayout from "../../components/layout/main-layout";

// =============================================================================
// DASHBOARD LAYOUT COMPONENT
// =============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}