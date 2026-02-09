'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Praga {
    id: number;
    nome: string;
    descricao: string;
    nivel: 'baixo' | 'medio' | 'alto' | 'critico';
    status: 'pendente' | 'resolvido';
    data_criacao: string;
    imagem?: string;
}

interface PragaListProps {
    fazendaId: number;
    onDelete?: (id: number) => void;
}

const nivelColors = {
    baixo: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    alto: 'bg-orange-100 text-orange-800',
    critico: 'bg-red-100 text-red-800',
};

const nivelLabels = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
};

export function PragaList({ fazendaId, onDelete }: PragaListProps) {
    const [pragas, setPragas] = useState<Praga[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('todos');

    useEffect(() => {
        fetchPragas();
    }, [fazendaId]);

    const fetchPragas = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/pragas/?fazenda=${fazendaId}`);
            const pragasList = Array.isArray(data) ? data : data.results || [];
            setPragas(pragasList);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar pragas:', err);
            setError('Erro ao carregar pragas');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePraga = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja deletar esta praga?')) return;

        try {
            await api.delete(`/api/pragas/${id}/`);
            setPragas(pragas.filter((p) => p.id !== id));
            if (onDelete) onDelete(id);
        } catch (err) {
            console.error('Erro ao deletar praga:', err);
            setError('Erro ao deletar praga');
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: 'pendente' | 'resolvido') => {
        try {
            await api.patch(`/api/pragas/${id}/atualizar_status/`, { status: newStatus });
            setPragas(pragas.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            setError('Erro ao atualizar status');
        }
    };

    const filteredPragas = pragas.filter((p) => {
        if (filter === 'pendente') return p.status === 'pendente';
        if (filter === 'resolvido') return p.status === 'resolvido';
        if (filter === 'critico') return p.nivel === 'critico';
        return true;
    });

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={filter === 'todos' ? 'default' : 'outline'}
                    onClick={() => setFilter('todos')}
                    size="sm"
                >
                    Todas ({pragas.length})
                </Button>
                <Button
                    variant={filter === 'pendente' ? 'default' : 'outline'}
                    onClick={() => setFilter('pendente')}
                    size="sm"
                    className="border-orange-200"
                >
                    Pendentes ({pragas.filter((p) => p.status === 'pendente').length})
                </Button>
                <Button
                    variant={filter === 'resolvido' ? 'default' : 'outline'}
                    onClick={() => setFilter('resolvido')}
                    size="sm"
                    className="border-green-200"
                >
                    Resolvidas ({pragas.filter((p) => p.status === 'resolvido').length})
                </Button>
                <Button
                    variant={filter === 'critico' ? 'default' : 'outline'}
                    onClick={() => setFilter('critico')}
                    size="sm"
                    className="border-red-200"
                >
                    Críticas ({pragas.filter((p) => p.nivel === 'critico').length})
                </Button>
            </div>

            {/* Lista de Pragas */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Carregando pragas...</div>
            ) : filteredPragas.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>Nenhuma praga registrada.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPragas.map((praga) => (
                        <Card key={praga.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{praga.nome}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ID: {praga.id} • {new Date(praga.data_criacao).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <Badge className={nivelColors[praga.nivel]}>
                                        {nivelLabels[praga.nivel]}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {/* Imagem */}
                                {praga.imagem && (
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={praga.imagem}
                                            alt={praga.nome}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Descrição */}
                                {praga.descricao && (
                                    <p className="text-sm text-gray-700 line-clamp-2">{praga.descricao}</p>
                                )}

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    {praga.status === 'pendente' ? (
                                        <>
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm text-orange-700 font-medium">Pendente</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-green-700 font-medium">Resolvida</span>
                                        </>
                                    )}
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2 pt-2">
                                    {praga.status === 'pendente' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-green-300 text-green-700"
                                            onClick={() => handleUpdateStatus(praga.id, 'resolvido')}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Resolver
                                        </Button>
                                    )}
                                    {praga.status === 'resolvido' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-orange-300 text-orange-700"
                                            onClick={() => handleUpdateStatus(praga.id, 'pendente')}
                                        >
                                            <Clock className="h-4 w-4 mr-1" />
                                            Reabrir
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeletePraga(praga.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
