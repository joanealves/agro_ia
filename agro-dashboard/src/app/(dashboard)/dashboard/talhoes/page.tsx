"use client";

import { useState, useEffect } from "react";
import { Map, Plus, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { TalhaoList } from "../../../../components/dashboard/TalhaoList";
import { TalhaoMap } from "../../../../components/dashboard/TalhaoMap";
import { useAuth } from "@/hooks/useAuth";
import api from "../../../../lib/api";

interface Fazenda {
    id: number;
    nome: string;
}

export default function TalhoesPage() {
    const { user } = useAuth();
    const [fazendas, setFazendas] = useState<Fazenda[]>([]);
    const [selectedFazenda, setSelectedFazenda] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFazendas = async () => {
            try {
                const { data } = await api.get("/api/fazendas/");
                const fazList = Array.isArray(data) ? data : data.results || [];
                setFazendas(fazList);
                if (fazList.length > 0 && !selectedFazenda) {
                    setSelectedFazenda(fazList[0].id);
                }
            } catch (err) {
                console.error("Erro ao carregar fazendas:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFazendas();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Map className="h-8 w-8 text-primary" />
                        Talhões
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os talhões das suas fazendas
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedFazenda || ""}
                        onChange={(e) => setSelectedFazenda(Number(e.target.value))}
                        className="px-3 py-2 border rounded-lg bg-background text-foreground"
                    >
                        {fazendas.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedFazenda ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Lista de Talhões */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Talhões</CardTitle>
                            <CardDescription>
                                Talhões cadastrados nesta fazenda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TalhaoList fazendaId={selectedFazenda} />
                        </CardContent>
                    </Card>

                    {/* Mapa de Talhões */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mapa da Fazenda</CardTitle>
                            <CardDescription>
                                Visualização geográfica dos talhões
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <TalhaoMap
                                fazendaId={selectedFazenda}
                                latitude={-23.55}
                                longitude={-46.63}
                            />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Map className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {fazendas.length === 0
                                ? "Nenhuma fazenda cadastrada. Crie uma fazenda primeiro."
                                : "Selecione uma fazenda para ver os talhões."}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
