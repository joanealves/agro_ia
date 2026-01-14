"use client";

import { useEffect, useState } from "react";
import { 
  Home, 
  Bug, 
  Cloud, 
  Bell, 
  Droplets, 
  TrendingUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Leaf,
  ThermometerSun
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../providers/AuthProvider";
import { getDashboardData } from "../../../lib/api";
import type { DashboardData } from "../../../types";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "danger";
}

function StatCard({ title, value, description, icon: Icon, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5", 
    danger: "border-red-500/30 bg-red-500/5",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData();
      
      if (dashboardData && typeof dashboardData === 'object') {
        setData(dashboardData);
      } else {
        throw new Error("Dados inválidos");
      }
    } catch (err: any) {
      console.error("Erro ao carregar dashboard:", err);
      
      if (err?.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err?.response?.status === 404) {
        setError("API não encontrada. Verifique se o backend está rodando.");
      } else if (err?.code === "ERR_NETWORK") {
        setError("Não foi possível conectar ao servidor.");
      } else {
        setError("Erro ao carregar dados do dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayData = {
    total_fazendas: data?.total_fazendas ?? 0,
    total_pragas: data?.total_pragas ?? 0,
    total_notificacoes: data?.total_notificacoes ?? 0,
    clima: {
      temp_media: data?.clima?.temp_media ?? 0,
      umidade_media: data?.clima?.umidade_media ?? 0,
      chuva_total: data?.clima?.chuva_total ?? 0,
    },
    produtividade: Array.isArray(data?.produtividade) ? data.produtividade : [],
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo das suas fazendas hoje.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Erro */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground">
                Verifique se o backend está rodando em http://localhost:8000
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Cards principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total de Fazendas"
              value={displayData.total_fazendas}
              description="Cadastradas"
              icon={Home}
              variant="success"
            />
            <StatCard
              title="Pragas Detectadas"
              value={displayData.total_pragas}
              description="Registros ativos"
              icon={Bug}
              variant={displayData.total_pragas > 0 ? "warning" : "default"}
            />
            <StatCard
              title="Temperatura Média"
              value={`${displayData.clima.temp_media.toFixed(1)}°C`}
              description="Últimas 24h"
              icon={ThermometerSun}
            />
            <StatCard
              title="Notificações"
              value={displayData.total_notificacoes}
              description="Não lidas"
              icon={Bell}
              variant={displayData.total_notificacoes > 5 ? "danger" : "default"}
            />
          </div>

          {/* Cards secundários */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Umidade Média"
              value={`${displayData.clima.umidade_media.toFixed(1)}%`}
              description="Todas as fazendas"
              icon={Droplets}
            />
            <StatCard
              title="Precipitação Total"
              value={`${displayData.clima.chuva_total.toFixed(1)} mm`}
              description="Últimos 30 dias"
              icon={Cloud}
            />
            <StatCard
              title="Produtividade"
              value={
                displayData.produtividade.length > 0
                  ? `${(
                      displayData.produtividade.reduce(
                        (sum, p) => sum + (p.media_produtividade || 0),
                        0
                      ) / displayData.produtividade.length
                    ).toFixed(0)} kg/ha`
                  : "N/A"
              }
              description="Média geral"
              icon={TrendingUp}
              variant="success"
            />
          </div>

          {/* Produtividade por Fazenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Produtividade por Fazenda
              </CardTitle>
              <CardDescription>
                Desempenho de cada fazenda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayData.produtividade.length > 0 ? (
                <div className="space-y-4">
                  {displayData.produtividade.map((item, index) => {
                    const maxProd = Math.max(
                      ...displayData.produtividade.map(p => p.media_produtividade || 0)
                    );
                    const percentage = maxProd > 0 
                      ? ((item.media_produtividade || 0) / maxProd) * 100 
                      : 0;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.fazenda__nome}</span>
                          <span className="text-muted-foreground">
                            {(item.media_produtividade || 0).toFixed(0)} kg/ha
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado de produtividade disponível.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}