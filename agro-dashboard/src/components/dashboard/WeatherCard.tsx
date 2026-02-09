'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import api from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../..//components/ui/skeleton';

interface WeatherData {
    temperatura_atual: number;
    umidade_atual: number;
    vento_atual: number;
    chuva_hoje: number;
    previsao_7_dias: Array<{
        data: string;
        temp_max: number;
        temp_min: number;
        chuva: number;
    }>;
    atualizado_em: string;
}

interface WeatherCardProps {
    fazendaId: number;
}

export function WeatherCard({ fazendaId }: WeatherCardProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/api/clima/atual/${fazendaId}/`);
                setWeather(data);
                setError(null);
            } catch (err: any) {
                setError('Erro ao carregar dados climáticos');
                console.error('Erro:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();

        // Atualizar a cada 30 minutos
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fazendaId]);

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !weather) {
        return (
            <Card className="w-full border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-800">Erro ao carregar clima</CardTitle>
                    <CardDescription className="text-red-700">{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Cards com dados atuais */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Temperatura</p>
                            <p className="text-2xl font-bold">{weather.temperatura_atual.toFixed(1)}°C</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Umidade</p>
                            <p className="text-2xl font-bold">{weather.umidade_atual.toFixed(0)}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Vento</p>
                            <p className="text-2xl font-bold">{weather.vento_atual.toFixed(1)} km/h</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Chuva Hoje</p>
                            <p className="text-2xl font-bold">{weather.chuva_hoje.toFixed(1)} mm</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de previsão/variação de temperatura */}
            <Card>
                <CardHeader>
                    <CardTitle>Previsão - 7 Dias</CardTitle>
                    <CardDescription>
                        Atualizado em {new Date(weather.atualizado_em).toLocaleDateString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weather.previsao_7_dias}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="data"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', {
                                    month: 'numeric',
                                    day: 'numeric',
                                })}
                            />
                            <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                                formatter={(value: any) => value?.toFixed(1)}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="temp_max"
                                stroke="#ef4444"
                                name="Máxima"
                                dot={false}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="temp_min"
                                stroke="#3b82f6"
                                name="Mínima"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Gráfico de precipitação */}
            <Card>
                <CardHeader>
                    <CardTitle>Precipitação Prevista</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weather.previsao_7_dias}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="data"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', {
                                    month: 'numeric',
                                    day: 'numeric',
                                })}
                            />
                            <YAxis label={{ value: 'Chuva (mm)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                            />
                            <Line
                                type="stepAfter"
                                dataKey="chuva"
                                stroke="#06b6d4"
                                name="Precipitação"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default WeatherCard;
