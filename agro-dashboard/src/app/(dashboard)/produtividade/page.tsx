'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ProdutividadeDashboard } from '../../../components/dashboard/ProdutividadeDashboard';
import { ProdutividadeComparativo } from '../../../components/dashboard/ProdutividadeComparativo';
import { ProdutividadePrevisao } from '../../../components/dashboard/ProdutividadePrevisao';
import axios from 'axios';

type Tab = 'dashboard' | 'comparativo' | 'previsao';

export default function ProdutividadePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [fazendas, setFazendas] = useState<any[]>([]);
    const [selectedFazenda, setSelectedFazenda] = useState<number | null>(null);
    const [loadingFazendas, setLoadingFazendas] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        const fetchFazendas = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/fazendas/');
                const fazendasData = response.data.results || response.data;
                setFazendas(fazendasData);
                if (fazendasData.length > 0) {
                    setSelectedFazenda(fazendasData[0].id);
                }
            } catch (err) {
                console.error('Erro ao buscar fazendas:', err);
            } finally {
                setLoadingFazendas(false);
            }
        };

        fetchFazendas();
    }, [authLoading, user, router]);

    if (authLoading || loadingFazendas) {
        return <div className="p-6 text-center text-gray-500">Carregando...</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Produtividade & Analytics</h1>
                        <p className="text-gray-600 mt-1">
                            Análise de produção, comparação entre talhões e previsões de rendimento
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="text-gray-700"
                    >
                        ← Voltar ao Dashboard
                    </Button>
                </div>

                {/* Seletor de Fazenda */}
                {fazendas.length > 1 && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex gap-2 flex-wrap">
                                {fazendas.map((fazenda) => (
                                    <Button
                                        key={fazenda.id}
                                        variant={selectedFazenda === fazenda.id ? 'default' : 'outline'}
                                        onClick={() => setSelectedFazenda(fazenda.id)}
                                        className="text-sm"
                                    >
                                        {fazenda.nome}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Abas */}
                <div className="mb-6">
                    <div className="flex gap-2 border-b border-gray-300">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'dashboard'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('comparativo')}
                            className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'comparativo'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ⚖️ Comparativo
                        </button>
                        <button
                            onClick={() => setActiveTab('previsao')}
                            className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'previsao'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            🔮 Previsão
                        </button>
                    </div>
                </div>

                {/* Conteúdo das Abas */}
                <div className="space-y-6">
                    {activeTab === 'dashboard' && <ProdutividadeDashboard fazendaId={selectedFazenda} />}

                    {activeTab === 'comparativo' && (
                        <ProdutividadeComparativo fazendaId={selectedFazenda} />
                    )}

                    {activeTab === 'previsao' && (
                        <ProdutividadePrevisao fazendaId={selectedFazenda} />
                    )}
                </div>

                {/* Footer com Dicas */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                📊 Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-gray-600">
                            Visualize rendimento ao longo do tempo, comparação entre talhões e distribuição de
                            culturas. Inclui estatísticas agregadas.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                ⚖️ Comparativo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-gray-600">
                            Compare produtividade e lucro entre múltiplos talhões. Veja diferenças percentuais e
                            identifique os melhores desempenhos.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                🔮 Previsão
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-gray-600">
                            Use regressão linear para prever rendimento futuro. Análise de risco e tendências
                            ajudam na tomada de decisão.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
