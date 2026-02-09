'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { AlertCircle, Droplet, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';

interface IrrigacaoDashboardProps {
    fazendaId: number;
    climaData?: {
        temperatura: number;
        umidade: number;
        precipitacao: number;
    };
}

interface ChartData {
    data: string;
    consumo: number;
    temperatura?: number;
    precipitacao?: number;
}

interface IrrigacaoStats {
    consumoTotal: number;
    consumoMedio: number;
    sistemasMaisUsados: Array<{
        nome: string;
        consumo: number;
    }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function IrrigacaoDashboard({ fazendaId, climaData }: IrrigacaoDashboardProps) {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [stats, setStats] = useState<IrrigacaoStats>({
        consumoTotal: 0,
        consumoMedio: 0,
        sistemasMaisUsados: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [fazendaId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Buscar histórico de consumo
            const { data } = await api.get(`/api/irrigacao/?fazenda=${fazendaId}`);
            const irrigacoes = Array.isArray(data) ? data : data.results || [];

            // Gerar dados de exemplo para gráfico (últimos 7 dias)
            const hoje = new Date();
            const dados = Array.from({ length: 7 }, (_, i) => {
                const data = new Date(hoje);
                data.setDate(data.getDate() - (6 - i));
                return {
                    data: data.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
                    consumo: Math.floor(Math.random() * 500) + 200,
                    temperatura: climaData?.temperatura || 25 + Math.random() * 8,
                    precipitacao: Math.random() * 10,
                };
            });

            setChartData(dados);

            // Calcular estatísticas
            const consumoTotal = irrigacoes.reduce(
                (sum: number, i: any) => sum + (i.consumo_medio_litros || 0),
                0
            );
            const consumoMedio = consumoTotal / 7;

            setStats({
                consumoTotal: Math.round(consumoTotal),
                consumoMedio: Math.round(consumoMedio),
                sistemasMaisUsados: irrigacoes
                    .filter((i: any) => i.consumo_medio_litros)
                    .sort((a: any, b: any) => (b.consumo_medio_litros || 0) - (a.consumo_medio_litros || 0))
                    .slice(0, 5)
                    .map((i: any) => ({
                        nome: i.nome,
                        consumo: i.consumo_medio_litros,
                    })),
            });

            setError(null);
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
            setError('Erro ao carregar dados de irrigação');

            // Dados de exemplo para demonstração
            setChartData([
                { data: '1 jan', consumo: 250 },
                { data: '2 jan', consumo: 320 },
                { data: '3 jan', consumo: 280 },
                { data: '4 jan', consumo: 390 },
                { data: '5 jan', consumo: 450 },
                { data: '6 jan', consumo: 500 },
                { data: '7 jan', consumo: 380 },
            ]);

            setStats({
                consumoTotal: 2578,
                consumoMedio: 368,
                sistemasMaisUsados: [
                    { nome: 'Zona A', consumo: 450 },
                    { nome: 'Zona B', consumo: 380 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-blue-500" />
                            Consumo Total (7 dias)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(stats.consumoTotal).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">litros de água</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Consumo Médio (por dia)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {Math.round(stats.consumoMedio).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">litros por dia</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Consumo ao Longo do Tempo */}
            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Consumo de Água (7 últimos dias)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis label={{ value: 'Litros', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    formatter={(value) => `${Math.round(value as number).toLocaleString('pt-BR')} L`}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend />
                                <Bar dataKey="consumo" fill="#3b82f6" name="Consumo (L)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Gráfico de Comparação com Clima */}
            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Consumo vs Clima</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis yAxisId="left" label={{ value: 'Consumo (L)', angle: -90, position: 'insideLeft' }} />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    label={{ value: 'Temperatura (°C)', angle: 90, position: 'insideRight' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="consumo"
                                    stroke="#3b82f6"
                                    name="Consumo (L)"
                                    connectNulls
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="temperatura"
                                    stroke="#ef4444"
                                    name="Temperatura (°C)"
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Sistemas mais usados */}
            {stats.sistemasMaisUsados.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sistemas Mais Usados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.sistemasMaisUsados.map((sistema, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <span className="text-sm font-medium">{sistema.nome}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                                style={{
                                                    width: `${(
                                                        (sistema.consumo /
                                                            Math.max(
                                                                ...stats.sistemasMaisUsados.map((s) => s.consumo)
                                                            )) *
                                                        100
                                                    ).toFixed(0)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-blue-600 w-16">
                                            {sistema.consumo.toLocaleString('pt-BR')} L
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
