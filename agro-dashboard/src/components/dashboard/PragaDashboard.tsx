'use client';

import { useRef, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Upload, Bug } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';

interface PragaDashboardProps {
    fazendaId: number;
    onPragaAdded?: () => void;
}

export function PragaDashboard({ fazendaId, onPragaAdded }: PragaDashboardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        nivel: 'medio',
        imagem: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            setError('Selecione um arquivo de imagem válido');
            return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Imagem deve ter no máximo 5MB');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setFormData((prev) => ({ ...prev, imagem: file }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.nome) {
            setError('Nome da praga é obrigatório');
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('fazenda', fazendaId.toString());
            data.append('nome', formData.nome);
            data.append('descricao', formData.descricao);
            data.append('nivel', formData.nivel);
            if (formData.imagem) {
                data.append('imagem', formData.imagem);
            }

            const response = await api.post('/api/pragas/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess(true);
            setFormData({ nome: '', descricao: '', nivel: 'medio', imagem: null });
            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Notificar pai
            if (onPragaAdded) {
                onPragaAdded();
            }

            // Limpar mensagens após 3 segundos
            setTimeout(() => setSuccess(false), 3000);
            setError(null);
        } catch (err: any) {
            console.error('Erro ao registrar praga:', err);
            const errorMsg = err.response?.data?.detail || err.message || 'Erro ao registrar praga';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Card de Resumo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        Registrar Nova Praga
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Registre uma praga encontrada em sua fazenda com foto para melhor identificação.
                    </p>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                ✓ Praga registrada com sucesso!
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome da Praga *</Label>
                            <Input
                                id="nome"
                                type="text"
                                placeholder="Ex: Lagarta-do-Chifre, Afídeo, etc"
                                value={formData.nome}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Nível de Severidade */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nivel">Nível de Severidade</Label>
                                <Select
                                    value={formData.nivel}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, nivel: value }))
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger id="nivel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baixo">🟢 Baixo</SelectItem>
                                        <SelectItem value="medio">🟡 Médio</SelectItem>
                                        <SelectItem value="alto">🟠 Alto</SelectItem>
                                        <SelectItem value="critico">🔴 Crítico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição (opcional)</Label>
                            <textarea
                                id="descricao"
                                placeholder="Descreva os sintomas, localização, danos observados..."
                                value={formData.descricao}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, descricao: e.target.value }))
                                }
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Upload de Imagem */}
                        <div className="space-y-2">
                            <Label htmlFor="imagem">Foto da Praga (opcional)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                {preview ? (
                                    <div className="space-y-2">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="max-h-40 mx-auto rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                            }}
                                            disabled={loading}
                                        >
                                            Trocar Imagem
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className="text-center cursor-pointer py-6"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            Clique para selecionar uma imagem
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG até 5MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="imagem"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                                className="hidden"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                type="submit"
                                disabled={loading || !formData.nome}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                                        Registrando...
                                    </>
                                ) : (
                                    <>
                                        <Bug className="h-4 w-4 mr-2" />
                                        Registrar Praga
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                onClick={() => {
                                    setFormData({ nome: '', descricao: '', nivel: 'medio', imagem: null });
                                    setPreview(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                            >
                                Limpar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-sm">💡 Dicas para melhor identificação</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-900 space-y-1">
                    <p>✓ Tire fotos claras em boa iluminação</p>
                    <p>✓ Fotografe a praga e a área afetada</p>
                    <p>✓ Descreva os danos observados</p>
                    <p>✓ Indique o nível de severidade com precisão</p>
                </CardContent>
            </Card>
        </div>
    );
}
