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

  if (loading) return <p className="text-center text-white">Carregando...</p>;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header />
        <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
        <FarmMap />
      </main>
    </div>
  );
}
