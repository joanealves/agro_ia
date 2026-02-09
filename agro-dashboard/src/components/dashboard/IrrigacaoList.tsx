'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Droplet, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Irrigacao {
    id: number;
    nome: string;
    status: 'ativo' | 'inativo';
    ultima_rega?: string;
    proxima_rega_recomendada?: string;
    consumo_medio_litros?: number;
}

interface IrrigacaoListProps {
    fazendaId: number;
    onStatusChange?: (id: number, status: boolean) => void;
}

export function IrrigacaoList({ fazendaId, onStatusChange }: IrrigacaoListProps) {
    const [irrigacoes, setIrrigacoes] = useState<Irrigacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchIrrigacoes();
    }, [fazendaId]);

    const fetchIrrigacoes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/irrigacao/?fazenda=${fazendaId}`);
            const irrigacoesList = Array.isArray(data) ? data : data.results || [];
            setIrrigacoes(irrigacoesList);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar irrigações:', err);
            setError('Erro ao carregar sistemas de irrigação');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: number, novoStatus: 'ativo' | 'inativo') => {
        try {
            await api.patch(`/api/irrigacao/${id}/`, {
                status: novoStatus,
            });
            setIrrigacoes(
                irrigacoes.map((i) =>
                    i.id === id ? { ...i, status: novoStatus } : i
                )
            );
            if (onStatusChange) {
                onStatusChange(id, novoStatus === 'ativo');
            }
        } catch (err) {
            console.error('Erro ao atualizar irrigação:', err);
            setError('Erro ao atualizar status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja deletar este sistema?')) return;

        try {
            await api.delete(`/api/irrigacao/${id}/`);
            setIrrigacoes(irrigacoes.filter((i) => i.id !== id));
        } catch (err) {
            console.error('Erro ao deletar irrigação:', err);
            setError('Erro ao deletar sistema');
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                    Carregando sistemas de irrigação...
                </div>
            ) : irrigacoes.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Droplet className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p>Nenhum sistema de irrigação registrado.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {irrigacoes.map((irrigacao) => (
                        <Card key={irrigacao.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Droplet className="h-5 w-5 text-blue-500" />
                                            {irrigacao.nome}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ID: {irrigacao.id}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={irrigacao.status === 'ativo' ? 'default' : 'outline'}
                                        className={
                                            irrigacao.status === 'ativo'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }
                                    >
                                        {irrigacao.status === 'ativo' ? '🟢 Ativo' : '⚪ Inativo'}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {/* Info Cards */}
                                {irrigacao.consumo_medio_litros && (
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                        <span className="text-sm text-gray-700">Consumo médio</span>
                                        <span className="font-semibold text-blue-700">
                                            {irrigacao.consumo_medio_litros.toLocaleString('pt-BR')} L
                                        </span>
                                    </div>
                                )}

                                {irrigacao.ultima_rega && (
                                    <div className="text-xs text-muted-foreground">
                                        <p>Última rega: {new Date(irrigacao.ultima_rega).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                )}

                                {irrigacao.proxima_rega_recomendada && (
                                    <div className="p-2 bg-amber-50 rounded border border-amber-200">
                                        <p className="text-xs text-amber-900 font-medium">
                                            🌱 Próxima rega em: {new Date(irrigacao.proxima_rega_recomendada).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                )}

                                {/* Ações */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant={irrigacao.status === 'ativo' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() =>
                                            handleToggleStatus(
                                                irrigacao.id,
                                                irrigacao.status === 'ativo' ? 'inativo' : 'ativo'
                                            )
                                        }
                                    >
                                        {irrigacao.status === 'ativo' ? (
                                            <>
                                                <PowerOff className="h-4 w-4 mr-1" />
                                                Desativar
                                            </>
                                        ) : (
                                            <>
                                                <Power className="h-4 w-4 mr-1" />
                                                Ativar
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(irrigacao.id)}
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
