'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Map } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TalhaoMap } from '../components/dashboard/TalhaoMap';
import { TalhaoList } from '../components/dashboard/TalhaoList';

interface Fazenda {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
}

export default function TalhoesPage() {
    const { user } = useAuth();
    const [fazendas, setFazendas] = useState<Fazenda[]>([]);
    const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'mapa' | 'lista'>('mapa');

    useEffect(() => {
        fetchFazendas();
    }, []);

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
                    <h1 className="text-3xl font-bold">Talhões</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie as parcelas de terra da sua fazenda
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

            {/* Botões de Visualização */}
            <div className="flex gap-2">
                <Button
                    variant={viewMode === 'mapa' ? 'default' : 'outline'}
                    onClick={() => setViewMode('mapa')}
                >
                    <Map className="h-4 w-4 mr-2" />
                    Mapa Interativo
                </Button>
                <Button
                    variant={viewMode === 'lista' ? 'default' : 'outline'}
                    onClick={() => setViewMode('lista')}
                >
                    📋 Lista
                </Button>
            </div>

            {/* Conteúdo */}
            {viewMode === 'mapa' ? (
                <TalhaoMap
                    fazendaId={selectedFazenda.id}
                    latitude={selectedFazenda.latitude}
                    longitude={selectedFazenda.longitude}
                />
            ) : (
                <TalhaoList fazendaId={selectedFazenda.id} />
            )}
        </div>
    );
}
