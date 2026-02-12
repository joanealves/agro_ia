'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface Talhao {
    id: number;
    nome: string;
    cultura: string;
    cultura_display: string;
    area_hectares: number;
    status: string;
    data_criacao: string;
    data_plantio?: string;
    data_colheita?: string;
    rendimento_esperado?: number;
    rendimento_real?: number;
}

interface TalhaoListProps {
    fazendaId: number;
}

export function TalhaoList({ fazendaId }: TalhaoListProps) {
    const [talhoes, setTalhoes] = useState<Talhao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTalhoes();
    }, [fazendaId]);

    const fetchTalhoes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/talhoes/?fazenda=${fazendaId}`);
            setTalhoes(data.results || data);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar talhões:', err);
            setError('Erro ao carregar talhões');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja deletar este talhão?')) return;

        try {
            await api.delete(`/api/talhoes/${id}/`);
            setTalhoes(talhoes.filter(t => t.id !== id));
        } catch (err) {
            console.error('Erro ao deletar:', err);
            setError('Erro ao deletar talhão');
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Carregando talhões...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Talhões</h2>
                <Button onClick={() => setShowForm(!showForm)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Talhão
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {showForm && <TalhaoForm fazendaId={fazendaId} onSuccess={() => { setShowForm(false); fetchTalhoes(); }} />}

            {talhoes.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        Nenhum talhão cadastrado
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {talhoes.map(talhao => (
                        <Card key={talhao.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">{talhao.nome}</CardTitle>
                                <CardDescription>{talhao.cultura_display}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Área</p>
                                    <p className="text-lg font-semibold">{talhao.area_hectares} ha</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="text-sm">{talhao.status}</p>
                                </div>
                                {talhao.rendimento_real && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Rendimento Real</p>
                                        <p className="text-sm">{talhao.rendimento_real} scs/ha</p>
                                    </div>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleDelete(talhao.id)}
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

interface TalhaoFormProps {
    fazendaId: number;
    onSuccess: () => void;
}

function TalhaoForm({ fazendaId, onSuccess }: TalhaoFormProps) {
    const [formData, setFormData] = useState({
        nome: '',
        cultura: 'milho',
        area_hectares: '',
        status: 'ativo',
        rendimento_esperado: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/api/talhoes/', {
                ...formData,
                fazenda: fazendaId,
                area_hectares: parseFloat(formData.area_hectares),
                rendimento_esperado: formData.rendimento_esperado ? parseFloat(formData.rendimento_esperado) : null,
            });

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erro ao criar talhão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-primary/50">
            <CardHeader>
                <CardTitle>Novo Talhão</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor="nome">Nome do Talhão</Label>
                        <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: Talhão A"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cultura">Cultura</Label>
                            <select
                                id="cultura"
                                value={formData.cultura}
                                onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="milho">Milho</option>
                                <option value="soja">Soja</option>
                                <option value="trigo">Trigo</option>
                                <option value="arroz">Arroz</option>
                                <option value="cana_de_acucar">Cana de Açúcar</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="area">Área (ha)</Label>
                            <Input
                                id="area"
                                type="number"
                                step="0.01"
                                value={formData.area_hectares}
                                onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                                placeholder="50"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="rendimento">Rendimento Esperado (scs/ha)</Label>
                        <Input
                            id="rendimento"
                            type="number"
                            step="0.01"
                            value={formData.rendimento_esperado}
                            onChange={(e) => setFormData({ ...formData, rendimento_esperado: e.target.value })}
                            placeholder="50"
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Criando...' : 'Criar Talhão'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
