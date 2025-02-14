"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import FarmMap from "@/components/maps/FarmMap";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  if (loading) return <p className="text-center text-foreground">Carregando...</p>;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header />
        <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
        {user?.role === "admin" ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Painel do Administrador</h2>
            {/* Conteúdo específico para admin */}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Painel do Usuário</h2>
            <FarmMap />
          </div>
        )}
      </main>
    </div>
  );
}