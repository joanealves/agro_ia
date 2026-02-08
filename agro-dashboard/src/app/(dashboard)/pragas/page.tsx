'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertCircle, Bug, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { PragaDashboard } from '../../../components/dashboard/PragaDashboard';
import { PragaList } from '../../../components/dashboard/PragaList';

interface Fazenda {
    id: number;
    nome: string;
}

interface PragaStats {
    total: number;
    pendentes: number;
    criticas: number;
}

export default function PragasPage() {
    const { user } = useAuth();
    const [fazendas, setFazendas] = useState<Fazenda[]>([]);
    const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null);
    const [stats, setStats] = useState<PragaStats>({ total: 0, pendentes: 0, criticas: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchFazendas();
    }, []);

    useEffect(() => {
        if (selectedFazenda) {
            fetchStats();
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

    const fetchStats = async () => {
        try {
            const { data } = await api.get(`/api/pragas/?fazenda=${selectedFazenda?.id}`);
            const pragasList = Array.isArray(data) ? data : data.results || [];

            setStats({
                total: pragasList.length,
                pendentes: pragasList.filter((p: any) => p.status === 'pendente').length,
                criticas: pragasList.filter((p: any) => p.nivel === 'critico').length,
            });
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        }
    };

    const handlePragaAdded = () => {
        setRefreshKey((prev) => prev + 1);
        fetchStats();
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pragas & Pestes</h1>
                    <p className="text-muted-foreground mt-1">
                        Registre e acompanhe as pragas encontradas em sua fazenda
                    </p>
                </div>
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

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Bug className="h-4 w-4" />
                            Total de Pragas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Registradas na fazenda
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            Pendentes de Resolução
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">{stats.pendentes}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Requerem ação imediata
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Nível Crítico
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{stats.criticas}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Severidade crítica
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dashboard (registro) */}
                <div className="lg:col-span-1">
                    <PragaDashboard fazendaId={selectedFazenda.id} onPragaAdded={handlePragaAdded} />
                </div>

                {/* Lista */}
                <div className="lg:col-span-2">
                    <PragaList key={refreshKey} fazendaId={selectedFazenda.id} onDelete={handlePragaAdded} />
                </div>
            </div>
        </div>
    );
}
