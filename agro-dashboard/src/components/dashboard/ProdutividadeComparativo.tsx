'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface ComparativoItem {
    talhao_id: number;
    talhao_nome: string;
    media: number;
    maximo: number;
    minimo: number;
    total_colheitas: number;
    lucro_total: number;
    custo_total: number;
}

interface Props {
    fazendaId: number | null;
}

export function ProdutividadeComparativo({ fazendaId }: Props) {
    const { user } = useAuth();
    const [talhoes, setTalhoes] = useState<any[]>([]);
    const [selectedTalhoes, setSelectedTalhoes] = useState<number[]>([]);
    const [comparativo, setComparativo] = useState<ComparativoItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [dias, setDias] = useState(90);

    useEffect(() => {
        if (!user || !fazendaId) return;

        const fetchTalhoes = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/talhoes/?fazenda=${fazendaId}`
                );
                setTalhoes(response.data.results || response.data);
            } catch (err) {
                console.error('Erro ao buscar talhões:', err);
            }
        };

        fetchTalhoes();
    }, [user, fazendaId]);

    const handleTalhaoToggle = (id: number) => {
        setSelectedTalhoes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleComparar = async () => {
        if (selectedTalhoes.length < 2) {
            alert('Selecione pelo menos 2 talhões para comparar');
            return;
        }

        try {
            setLoading(true);
            const talhaoIds = selectedTalhoes.join(',');
            const response = await axios.get(
                `http://localhost:8000/api/produtividade/comparativo/?talhao=${talhaoIds}&dias=${dias}`
            );
            setComparativo(response.data);
        } catch (err) {
            console.error('Erro ao buscar comparativo:', err);
        } finally {
            setLoading(false);
        }
    };

    const calcularDiferenca = (valor1: number, valor2: number) => {
        if (valor2 === 0) return 0;
        return Math.round(((valor1 - valor2) / valor2) * 100);
    };

    const getMelhorValor = (valores: number[]) => {
        return Math.max(...valores);
    };

    const getPiorValor = (valores: number[]) => {
        return Math.min(...valores);
    };

    if (!fazendaId) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                    Selecione uma fazenda para comparar produtividade
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Seleção de Talhões */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Selecione Talhões para Comparar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {talhoes.map((talhao) => (
                            <Button
                                key={talhao.id}
                                variant={selectedTalhoes.includes(talhao.id) ? 'default' : 'outline'}
                                onClick={() => handleTalhaoToggle(talhao.id)}
                                className="text-sm"
                            >
                                {talhao.nome}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Período (dias):
                            </label>
                            <select
                                value={dias}
                                onChange={(e) => setDias(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value={30}>Últimos 30 dias</option>
                                <option value={90}>Últimos 90 dias</option>
                                <option value={180}>Últimos 180 dias</option>
                                <option value={365}>Último ano</option>
                            </select>
                        </div>

                        <Button
                            onClick={handleComparar}
                            disabled={selectedTalhoes.length < 2 || loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Comparando...' : 'Comparar'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela Comparativa */}
            {comparativo.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Análise Comparativa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-300">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                            Talhão
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                            Rendimento Médio
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                            Máximo
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                            Mínimo
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                            Lucro Total
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                            Custo Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparativo.map((item) => {
                                        const mediaValues = comparativo.map((c) => c.media);
                                        const lucroValues = comparativo.map((c) => c.lucro_total || 0);
                                        const isMelhorMedia = item.media === getMelhorValor(mediaValues);
                                        const isMelhorLucro = item.lucro_total === getMelhorValor(lucroValues);

                                        return (
                                            <tr key={item.talhao_id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{item.talhao_nome}</td>
                                                <td
                                                    className={`py-3 px-4 text-right font-semibold ${isMelhorMedia ? 'text-green-600 bg-green-50' : 'text-gray-700'
                                                        }`}
                                                >
                                                    {Math.round(item.media)} kg/ha
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-700">
                                                    {Math.round(item.maximo)} kg/ha
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-700">
                                                    {Math.round(item.minimo)} kg/ha
                                                </td>
                                                <td
                                                    className={`py-3 px-4 text-right font-semibold ${isMelhorLucro && item.lucro_total > 0
                                                            ? 'text-green-600 bg-green-50'
                                                            : item.lucro_total < 0
                                                                ? 'text-red-600'
                                                                : 'text-gray-700'
                                                        }`}
                                                >
                                                    R$ {(item.lucro_total / 1000).toFixed(1)}k
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-700">
                                                    R$ {(item.custo_total / 1000).toFixed(1)}k
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Análise de Diferenças */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {comparativo.length === 2 && (
                                <>
                                    <Card className="bg-gray-50">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Diferença de Rendimento</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {calcularDiferenca(comparativo[0].media, comparativo[1].media)}%
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {comparativo[0].talhao_nome} vs {comparativo[1].talhao_nome}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-50">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Diferença de Lucro</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {calcularDiferenca(
                                                    comparativo[0].lucro_total || 0,
                                                    comparativo[1].lucro_total || 0
                                                )}%
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {comparativo[0].talhao_nome} vs {comparativo[1].talhao_nome}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedTalhoes.length < 2 && comparativo.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        Selecione pelo menos 2 talhões e clique em "Comparar"
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
