'use client';

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../..//components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface PrevisaoData {
    data: string;
    rendimento_previsto: number;
    intervalo_confianca: {
        minimo: number;
        maximo: number;
    };
}

interface PrevisaoResponse {
    status: string;
    mensagem?: string;
    tendencia: string;
    taxa_mudanca: number;
    media_historica: number;
    desvio_padrao: number;
    previsoes: PrevisaoData[];
}

interface Props {
    fazendaId: number | null;
}

export function ProdutividadePrevisao({ fazendaId }: Props) {
    const { user } = useAuth();
    const [talhoes, setTalhoes] = useState<any[]>([]);
    const [selectedTalhao, setSelectedTalhao] = useState<number | null>(null);
    const [previsao, setPrevisao] = useState<PrevisaoResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [diasFuturos, setDiasFuturos] = useState(30);

    useEffect(() => {
        if (!user || !fazendaId) return;

        const fetchTalhoes = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/talhoes/?fazenda=${fazendaId}`
                );
                const talhoesData = response.data.results || response.data;
                setTalhoes(talhoesData);
                if (talhoesData.length > 0) {
                    setSelectedTalhao(talhoesData[0].id);
                }
            } catch (err) {
                console.error('Erro ao buscar talhões:', err);
            }
        };

        fetchTalhoes();
    }, [user, fazendaId]);

    const handleGerarPrevisao = async () => {
        if (!selectedTalhao) {
            alert('Selecione um talhão');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `http://localhost:8000/api/produtividade/previsao/?talhao=${selectedTalhao}&dias_futuros=${Math.ceil(diasFuturos / 30)}&dias_passados=180`
            );

            if (response.data.status === 'insuficiente_dados') {
                setError(response.data.mensagem);
                setPrevisao(null);
            } else {
                setPrevisao(response.data);
                setError(null);
            }
        } catch (err: any) {
            console.error('Erro ao gerar previsão:', err);
            setError(err.response?.data?.detail || 'Erro ao gerar previsão');
            setPrevisao(null);
        } finally {
            setLoading(false);
        }
    };

    const getTendenciaIcon = (tendencia: string) => {
        switch (tendencia) {
            case 'aumentando':
                return '📈';
            case 'diminuindo':
                return '📉';
            default:
                return '➡️';
        }
    };

    const getTendenciaColor = (tendencia: string) => {
        switch (tendencia) {
            case 'aumentando':
                return 'text-green-600';
            case 'diminuindo':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRiscoIndicador = (taxa: number, desvio: number) => {
        const coeficiente = Math.abs(taxa / (desvio || 1));
        if (taxa < 0 && coeficiente > 0.2) return { nivel: 'Alto', cor: 'red', icon: '🔴' };
        if (taxa < 0) return { nivel: 'Médio', cor: 'orange', icon: '🟡' };
        return { nivel: 'Baixo', cor: 'green', icon: '🟢' };
    };

    if (!fazendaId) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                    Selecione uma fazenda para visualizar previsões
                </CardContent>
            </Card>
        );
    }

    const talhaoNome =
        talhoes.find((t) => t.id === selectedTalhao)?.nome || 'Talhão selecionado';
    const risco = previsao ? getRiscoIndicador(previsao.taxa_mudanca, previsao.desvio_padrao) : null;

    return (
        <div className="space-y-4">
            {/* Seleção de Talhão */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Selecione Talhão para Previsão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {talhoes.map((talhao) => (
                            <Button
                                key={talhao.id}
                                variant={selectedTalhao === talhao.id ? 'default' : 'outline'}
                                onClick={() => setSelectedTalhao(talhao.id)}
                                className="text-sm"
                            >
                                {talhao.nome}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dias Futuros:
                            </label>
                            <select
                                value={diasFuturos}
                                onChange={(e) => setDiasFuturos(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value={30}>Próximos 30 dias</option>
                                <option value={60}>Próximos 60 dias</option>
                                <option value={90}>Próximos 90 dias</option>
                            </select>
                        </div>

                        <Button
                            onClick={handleGerarPrevisao}
                            disabled={!selectedTalhao || loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Gerando...' : 'Gerar Previsão'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Indicadores */}
            {previsao && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Tendência</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getTendenciaColor(previsao.tendencia)}`}>
                                    {getTendenciaIcon(previsao.tendencia)} {previsao.tendencia}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">taxa de mudança</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Taxa de Mudança
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {previsao.taxa_mudanca > 0 ? '+' : ''}
                                    {previsao.taxa_mudanca.toFixed(3)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">kg/ha por período</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Média Histórica
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    {Math.round(previsao.media_historica)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">kg/ha</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Risco</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold text-${risco?.cor}-600`}>
                                    {risco?.icon} {risco?.nivel}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">de redução no rendimento</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráfico de Previsão */}
                    {previsao.previsoes.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Previsão de Rendimento - {talhaoNome}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={previsao.previsoes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="data"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            label={{ value: 'Rendimento (kg/ha)', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Tooltip
                                            formatter={(value: any) => {
                                                if (typeof value === 'number') {
                                                    return `${Math.round(value)} kg/ha`;
                                                }
                                                return value;
                                            }}
                                            contentStyle={{
                                                backgroundColor: '#f3f4f6',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '0.5rem',
                                            }}
                                        />
                                        <Legend />

                                        {/* Linha de média histórica */}
                                        <ReferenceLine
                                            y={previsao.media_historica}
                                            stroke="#9ca3af"
                                            strokeDasharray="5 5"
                                            label={{
                                                value: `Média: ${Math.round(previsao.media_historica)} kg/ha`,
                                                position: 'right',
                                                fill: '#6b7280',
                                                fontSize: 12,
                                            }}
                                        />

                                        {/* Linha de previsão */}
                                        <Line
                                            type="monotone"
                                            dataKey="rendimento_previsto"
                                            stroke="#3b82f6"
                                            dot={{ fill: '#3b82f6', r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="Rendimento Previsto"
                                            strokeWidth={2}
                                        />

                                        {/* Intervalo de confiança (como área) */}
                                        <Line
                                            type="monotone"
                                            dataKey={(d) => d.intervalo_confianca.maximo}
                                            stroke="transparent"
                                            name="Máximo"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={(d) => d.intervalo_confianca.minimo}
                                            stroke="transparent"
                                            name="Mínimo"
                                            fill="#e0e7ff"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>

                                {/* Interpretação */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-2">📊 Interpretação</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>
                                            • A linha azul representa a previsão de rendimento para os próximos
                                            períodos
                                        </li>
                                        <li>
                                            • A área sombreada indica o intervalo de confiança (estimativa de
                                            variabilidade)
                                        </li>
                                        <li>
                                            • A linha pontilhada cinza é a média histórica do talhão
                                        </li>
                                        <li>
                                            • Uma tendência de {previsao.tendencia} indica que o rendimento tende a{' '}
                                            {previsao.tendencia === 'aumentando'
                                                ? 'MELHORAR'
                                                : previsao.tendencia === 'diminuindo'
                                                    ? 'PIORAR'
                                                    : 'MANTER-SE ESTÁVEL'}
                                        </li>
                                    </ul>
                                </div>

                                {/* Recomendações */}
                                {previsao.taxa_mudanca < -0.5 && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                        <h4 className="font-semibold text-red-900 mb-2">⚠️ Atenção</h4>
                                        <p className="text-sm text-red-800">
                                            O rendimento está em tendência de queda. Recomenda-se:
                                        </p>
                                        <ul className="text-sm text-red-800 mt-2 ml-4 list-disc">
                                            <li>Revisar sistema de irrigação</li>
                                            <li>Analisar dados climáticos e pragas</li>
                                            <li>Considerar mudança de variedade ou cultivo</li>
                                            <li>Aumentar frequência de monitoramento</li>
                                        </ul>
                                    </div>
                                )}

                                {previsao.taxa_mudanca > 0.5 && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-900 mb-2">✅ Excelente</h4>
                                        <p className="text-sm text-green-800">
                                            O rendimento está em tendência de aumento! Continue com as práticas
                                            atuais e considere documentar as mudanças bem-sucedidas para replicação em
                                            outros talhões.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-700 text-sm">{error}</p>
                        <p className="text-red-600 text-xs mt-2">
                            💡 Dica: Registre mais colheitas para melhorar a precisão das previsões
                        </p>
                    </CardContent>
                </Card>
            )}

            {!previsao && !error && (
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        Selecione um talhão e clique em "Gerar Previsão"
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
