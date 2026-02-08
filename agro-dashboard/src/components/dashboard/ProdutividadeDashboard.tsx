'use client';

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface DadosProdutividade {
    id: number;
    talhao_nome: string;
    cultura: string;
    rendimento_kg_ha: number;
    data_colheita: string;
    data_atualizacao: string;
    area_hectares: number;
    lucro_total: number;
    receita_total: number;
}

interface Props {
    fazendaId: number | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ProdutividadeDashboard({ fazendaId }: Props) {
    const { user } = useAuth();
    const [dados, setDados] = useState<DadosProdutividade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [talhaoComparativo, setTalhaoComparativo] = useState<any[]>([]);
    const [culturaDistribuicao, setCulturaDistribuicao] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !fazendaId) {
            setLoading(false);
            return;
        }

        const fetchDados = async () => {
            try {
                setLoading(true);

                // Buscar dados de produtividade
                const url = `http://localhost:8000/api/produtividade/?fazenda=${fazendaId}`;
                const response = await axios.get(url);

                setDados(response.data.results || response.data);

                // Buscar estatísticas
                const statsResponse = await axios.get(
                    `http://localhost:8000/api/produtividade/dashboard/?fazenda=${fazendaId}`
                );
                setStats(statsResponse.data.estatisticas);
                setTalhaoComparativo(statsResponse.data.top_talhoes || []);
                setCulturaDistribuicao(statsResponse.data.culturas || []);

                setError(null);
            } catch (err: any) {
                console.error('Erro ao buscar dados:', err);
                setError(err.response?.data?.detail || 'Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };

        fetchDados();
    }, [user, fazendaId]);

    if (!fazendaId) {
        return (
            <Card className="col-span-2">
                <CardContent className="pt-6 text-center text-gray-500">
                    Selecione uma fazenda para visualizar produtividade
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className="col-span-2">
                <CardContent className="pt-6 text-center text-gray-500">
                    Carregando dados...
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="col-span-2">
                <CardContent className="pt-6 text-center text-red-500">
                    {error}
                </CardContent>
            </Card>
        );
    }

    // Preparar dados para gráfico de linha (rendimento ao longo do tempo)
    const rendimentoChartData = dados
        .sort((a, b) => new Date(a.data_colheita).getTime() - new Date(b.data_colheita).getTime())
        .map((d) => ({
            data: new Date(d.data_colheita).toLocaleDateString('pt-BR'),
            rendimento: Math.round(d.rendimento_kg_ha),
            cultura: d.cultura,
        }));

    // Preparar dados para gráfico de comparativo
    const comparativoData = talhaoComparativo.map((t) => ({
        talhao: t.talhao_nome || 'N/A',
        rendimento: Math.round(t.rendimento_medio || 0),
    }));

    // Preparar dados para gráfico de pizza (culturas)
    const pizzaData = culturaDistribuicao.map((c) => ({
        name: c.cultura,
        value: Math.round(c.total_area || 0),
    }));

    return (
        <div className="space-y-4">
            {/* Cards de Sumário */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Melhor Rendimento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.melhor_rendimento ? `${Math.round(stats.melhor_rendimento)} kg/ha` : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">máximo registrado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Rendimento Médio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats?.media_rendimento ? `${Math.round(stats.media_rendimento)} kg/ha` : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">geral da fazenda</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pior Rendimento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {stats?.pior_rendimento ? `${Math.round(stats.pior_rendimento)} kg/ha` : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">mínimo registrado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Lucro Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {stats?.lucro_total
                                ? `R$ ${(stats.lucro_total / 1000).toFixed(1)}k`
                                : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">todas as colheitas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Rendimento ao longo do tempo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Rendimento ao Longo do Tempo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rendimentoChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={rendimentoChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} />
                                    <YAxis label={{ value: 'kg/ha', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        formatter={(value: any) => `${value} kg/ha`}
                                        contentStyle={{
                                            backgroundColor: '#f3f4f6',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="rendimento"
                                        stroke="#3b82f6"
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name="Rendimento (kg/ha)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                Sem dados de rendimento
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Comparativo Talhões */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Top 5 Talhões</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {comparativoData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={comparativoData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="talhao" angle={-45} textAnchor="end" height={80} />
                                    <YAxis label={{ value: 'kg/ha', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        formatter={(value: any) => `${value} kg/ha`}
                                        contentStyle={{
                                            backgroundColor: '#f3f4f6',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="rendimento"
                                        fill="#10b981"
                                        name="Rendimento Médio"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                Sem dados de talhões
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Distribuição de Culturas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Distribuição de Culturas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pizzaData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pizzaData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}ha`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pizzaData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `${value} hectares`}
                                        contentStyle={{
                                            backgroundColor: '#f3f4f6',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                Sem dados de culturas
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resumo de Culturas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Resumo por Cultura</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {culturaDistribuicao.length > 0 ? (
                                culturaDistribuicao.map((cultura, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-gray-800">{cultura.cultura}</p>
                                            <p className="text-xs text-gray-500">
                                                {Math.round(cultura.total_area)} ha
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-blue-600">
                                                {Math.round(cultura.media_rendimento)} kg/ha
                                            </p>
                                            <p className="text-xs text-gray-500">rendimento</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center">Sem culturas registradas</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
