import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/providers/AuthProvider";
import DashboardSidebar from "./layout/dashboard-sidebar";
import Header from "../../components/layout/Header";
import { getDashboardData } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface DashboardData {
    total_pragas: number;
    clima: {
        temp_media: number;
        umidade_media: number;
        chuva_total: number;
    };
    produtividade: {
        fazenda__nome: string;
        media_produtividade: number;
    }[];
}

const DashboardPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            router.push("/login");
            return;
        }

        fetchDashboardData();
    }, [user, loading, router]);

    const fetchDashboardData = async () => {
        setDataLoading(true);
        try {
            const data = await getDashboardData();
            setDashboardData(data as DashboardData); // Use type assertion here
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar dados do dashboard:", err);
            setError("Falha ao carregar dados do dashboard");
        } finally {
            setDataLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-foreground text-xl">Carregando...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <DashboardSidebar />
            <div className="flex-1 overflow-y-auto">
                {user && <Header user={user} onMenuClick={() => {}} />}
                <main className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Bem-vindo, {user.name}!</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                            <button
                                onClick={fetchDashboardData}
                                className="mt-2 bg-red-700 text-white px-4 py-1 rounded text-sm"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {dataLoading ? (
                        <div className="bg-gray-100 p-6 rounded-lg">
                            <p className="text-gray-700">Carregando dados do dashboard...</p>
                        </div>
                    ) : dashboardData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>Total de Pragas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{dashboardData.total_pragas || 0}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>Dados Climáticos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData?.clima && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Temperatura Média:</span>
                                                <span className="font-medium">{dashboardData.clima.temp_media?.toFixed(1)}°C</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Umidade Média:</span>
                                                <span className="font-medium">{dashboardData.clima.umidade_media?.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Precipitação Total:</span>
                                                <span className="font-medium">{dashboardData.clima.chuva_total?.toFixed(1)} mm</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>Produtividade por Fazenda</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData?.produtividade && dashboardData.produtividade.length > 0 ? (
                                        <div className="space-y-2">
                                            {dashboardData.produtividade.slice(0, 5).map((item, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span>{item.fazenda__nome}</span>
                                                    <span className="font-medium">{item.media_produtividade?.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Sem dados de produtividade</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <p>Nenhum dado disponível.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;