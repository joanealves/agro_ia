'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertCircle, Lightbulb, Droplet, Gauge } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface Recomendacao {
    nivel: 'baixo' | 'medio' | 'alto' | 'critico';
    acao: string;
    urgencia: 'normal' | 'importante' | 'urgente';
    motivo: string;
}

interface IrrigacaoRecomendacaoProps {
    fazendaId: number;
    climaData?: {
        temperatura: number;
        umidade: number;
        precipitacao: number;
    };
}

const urgenciaColors = {
    normal: 'bg-blue-100 text-blue-800 border-blue-300',
    importante: 'bg-amber-100 text-amber-800 border-amber-300',
    urgente: 'bg-red-100 text-red-800 border-red-300',
};

const urgenciaIcons = {
    normal: '💧',
    importante: '⚠️',
    urgente: '🚨',
};

export function IrrigacaoRecomendacao({ fazendaId, climaData }: IrrigacaoRecomendacaoProps) {
    const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        gerarRecomendacoes();
    }, [climaData, fazendaId]);

    const gerarRecomendacoes = async () => {
        setLoading(true);

        try {
            // Buscar dados da fazenda
            const { data: fazendaData } = await api.get(`/api/fazendas/${fazendaId}/`);

            const temp = climaData?.temperatura || 25;
            const umidade = climaData?.umidade || 50;
            const precipitacao = climaData?.precipitacao || 0;

            const recs: Recomendacao[] = [];

            // Regra 1: Temperatura alta + umidade baixa
            if (temp > 28 && umidade < 40) {
                recs.push({
                    nivel: 'critico',
                    acao: 'Aumentar frequência de irrigação',
                    urgencia: 'urgente',
                    motivo: `Temperatura ${temp.toFixed(1)}°C com umidade ${umidade}% é crítica`,
                });
            }

            // Regra 2: Temperatura moderada
            if (temp > 22 && temp <= 28 && umidade < 50) {
                recs.push({
                    nivel: 'alto',
                    acao: 'Regar em 1-2 dias',
                    urgencia: 'importante',
                    motivo: `Condições secas: temp ${temp.toFixed(1)}°C, umidade ${umidade}%`,
                });
            }

            // Regra 3: Chuva recente
            if (precipitacao > 5) {
                recs.push({
                    nivel: 'baixo',
                    acao: 'Reduzir irrigação nos próximos 2 dias',
                    urgencia: 'normal',
                    motivo: `Chuva de ${precipitacao.toFixed(1)}mm detectada`,
                });
            }

            // Regra 4: Umidade alta
            if (umidade > 75) {
                recs.push({
                    nivel: 'baixo',
                    acao: 'Rega opcional, monitorar solo',
                    urgencia: 'normal',
                    motivo: `Umidade alta (${umidade}%) - risco de doenças fúngicas`,
                });
            }

            // Se nenhuma recomendação foi gerada
            if (recs.length === 0) {
                recs.push({
                    nivel: 'medio',
                    acao: 'Manter irrigação regular',
                    urgencia: 'normal',
                    motivo: 'Condições climáticas favoráveis',
                });
            }

            setRecomendacoes(recs);
        } catch (err) {
            console.error('Erro ao gerar recomendações:', err);
            // Recomendação padrão
            setRecomendacoes([
                {
                    nivel: 'medio',
                    acao: 'Monitorar condições climáticas',
                    urgencia: 'normal',
                    motivo: 'Verifique dados climáticos atualizados',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Card de Status Climático */}
            {climaData && (
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span>📊 Condições Climáticas Atuais</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{climaData.temperatura.toFixed(1)}°C</div>
                                <p className="text-xs text-gray-600 mt-1">Temperatura</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{climaData.umidade.toFixed(0)}%</div>
                                <p className="text-xs text-gray-600 mt-1">Umidade</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-600">{climaData.precipitacao.toFixed(1)}mm</div>
                                <p className="text-xs text-gray-600 mt-1">Precipitação</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recomendações */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Recomendações de Rega
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <p className="text-center text-muted-foreground">Analisando dados climáticos...</p>
                    ) : recomendacoes.length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhuma recomendação no momento</p>
                    ) : (
                        <div className="space-y-3">
                            {recomendacoes.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border-l-4 ${urgenciaColors[rec.urgencia]}`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">{urgenciaIcons[rec.urgencia]}</span>
                                                <h3 className="font-semibold">{rec.acao}</h3>
                                            </div>
                                            <p className="text-sm opacity-90">{rec.motivo}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                rec.nivel === 'critico'
                                                    ? 'bg-red-100 text-red-800'
                                                    : rec.nivel === 'alto'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : rec.nivel === 'medio'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-green-100 text-green-800'
                                            }
                                        >
                                            {rec.nivel.charAt(0).toUpperCase() + rec.nivel.slice(1)}
                                        </Badge>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-3 flex gap-2">
                                        <Button size="sm" variant="default" className="flex-1">
                                            <Droplet className="h-4 w-4 mr-1" />
                                            Iniciar Rega
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Detalhes
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        💡 Dicas de Irrigação
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-900 space-y-2">
                    <p>✓ Melhor horário: Amanhecer (05:00-07:00) ou entardecer (17:00-19:00)</p>
                    <p>✓ Evitar: Horário quente (11:00-16:00) para reduzir evaporação</p>
                    <p>✓ Frequência: Ajustar conforme precipitação e tipo de solo</p>
                    <p>✓ Duração: Regar profundamente mas menos frequente é melhor</p>
                </CardContent>
            </Card>
        </div>
    );
}
