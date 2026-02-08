// "use client";

// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import Sidebar from "./Sidebar";
// import  Header  from "../layout/Header";
// import { useAuth } from "../../app/providers/AuthProvider";

// interface MainLayoutProps {
//   children: React.ReactNode;
// }

// export default function MainLayout({ children }: MainLayoutProps) {
//   const { user, isLoading } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const pathname = usePathname();

//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [pathname]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <div className="flex h-screen overflow-hidden bg-background">
//       {/* Sidebar desktop */}
//       <div className="hidden md:flex md:w-64 md:flex-col">
//         <Sidebar />
//       </div>

//       {/* overlay mobile */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/50 md:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar mobile */}
//       <div
//         className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <Sidebar />
//       </div>

//       {/* Conteúdo */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         <Header
//           onMenuClick={() => setSidebarOpen(!sidebarOpen)}
//           user={user}
//         />
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }





"use client";

// =============================================================================
// MAIN LAYOUT - Layout principal do dashboard
// =============================================================================

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

// =============================================================================
// TYPES
// =============================================================================

interface MainLayoutProps {
  children: React.ReactNode;
}

// =============================================================================
// MAIN LAYOUT COMPONENT
// =============================================================================

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fecha sidebar no mobile quando muda de página
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado (debug-friendly)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Não autenticado
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:flex-col">
        <Sidebar />
      </div>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
