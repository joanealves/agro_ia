'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Droplet, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IrrigacaoDashboard } from '@/components/dashboard/IrrigacaoDashboard';
import { IrrigacaoList } from '@/components/dashboard/IrrigacaoList';
import { IrrigacaoRecomendacao } from '@/components/dashboard/IrrigacaoRecomendacao';

interface Fazenda {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
}

interface ClimaData {
    temperatura: number;
    umidade: number;
    precipitacao: number;
}

export default function IrrigacaoPage() {
    const { user } = useAuth();
    const [fazendas, setFazendas] = useState<Fazenda[]>([]);
    const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null);
    const [climaData, setClimaData] = useState<ClimaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFazendas();
    }, []);

    useEffect(() => {
        if (selectedFazenda) {
            fetchClimaData();
        }
    }, [selectedFazenda]);

    const fetchFazendas = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/fazendas/');
            const list = data.results || data;
            setFazendas(list);

            if (list.length > 0) {
                setSelectedFazenda(list[0]);
            }
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar fazendas:', err);
            setError('Erro ao carregar fazendas');
        } finally {
            setLoading(false);
        }
    };

    const fetchClimaData = async () => {
        try {
            // Buscar dados climáticos atuais
            const { data } = await api.get(`/api/clima/atual/${selectedFazenda?.id}/`);

            if (data.atual) {
                setClimaData({
                    temperatura: data.atual.temperatura || 25,
                    umidade: data.atual.umidade || 50,
                    precipitacao: data.atual.precipitacao || 0,
                });
            }
        } catch (err) {
            console.warn('Clima não disponível, usando valores padrão:', err);
            // Usar valores padrão se a API não estiver disponível
            setClimaData({
                temperatura: 25,
                umidade: 50,
                precipitacao: 0,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    if (!selectedFazenda) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Nenhuma fazenda encontrada. Crie uma fazenda primeiro.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Irrigação</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus sistemas de irrigação e receba recomendações inteligentes
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Sistema
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Seletor de Fazenda */}
            {fazendas.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Selecione a Fazenda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {fazendas.map((fazenda) => (
                                <Button
                                    key={fazenda.id}
                                    variant={selectedFazenda.id === fazenda.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedFazenda(fazenda)}
                                    className="justify-start"
                                >
                                    {fazenda.nome}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna da Esquerda: Dashboard + Lista */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dashboard com gráficos */}
                    <IrrigacaoDashboard fazendaId={selectedFazenda.id} climaData={climaData || undefined} />

                    {/* Lista de Sistemas */}
                    <IrrigacaoList fazendaId={selectedFazenda.id} />
                </div>

                {/* Coluna da Direita: Recomendações */}
                <div className="lg:col-span-1">
                    <IrrigacaoRecomendacao fazendaId={selectedFazenda.id} climaData={climaData || undefined} />
                </div>
            </div>
        </div>
    );
}
