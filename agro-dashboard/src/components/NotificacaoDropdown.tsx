'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Archive, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface Notificacao {
    id: number;
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'alerta' | 'critico' | 'sucesso' | 'erro';
    categoria: string;
    prioridade: number;
    lida: boolean;
    acao_requerida: boolean;
    link?: string;
    data_criacao: string;
    dias_atras: string;
}

interface NotificacaoDropdownProps {
    className?: string;
}

const tipoColors = {
    info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    alerta: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    critico: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    sucesso: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    erro: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
};

const tipoBadges = {
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    alerta: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    critico: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    sucesso: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    erro: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
};

export function NotificacaoDropdown({ className = '' }: NotificacaoDropdownProps) {
    const { user } = useAuth();
    const [aberto, setAberto] = useState(false);
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [naoLidas, setNaoLidas] = useState(0);
    const [carregando, setCarregando] = useState(false);

    // Buscar notificações periodicamente (polling)
    useEffect(() => {
        if (!user) return;

        const buscarNotificacoes = async () => {
            try {
                setCarregando(true);
                const response = await axios.get('http://localhost:8000/api/notificacoes/recentes/');
                setNotificacoes(response.data);

                // Buscar contagem de não lidas
                const countResponse = await axios.get('http://localhost:8000/api/notificacoes/contagem/');
                setNaoLidas(countResponse.data.count);
            } catch (err) {
                console.error('Erro ao buscar notificações:', err);
            } finally {
                setCarregando(false);
            }
        };

        buscarNotificacoes();
        const interval = setInterval(buscarNotificacoes, 30000); // Atualizar a cada 30s

        return () => clearInterval(interval);
    }, [user]);

    const marcarComoLida = async (id: number) => {
        try {
            await axios.post(`http://localhost:8000/api/notificacoes/${id}/ler/`);
            setNotificacoes((prev) =>
                prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
            );
            setNaoLidas((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Erro ao marcar como lida:', err);
        }
    };

    const marcarTodasComoLida = async () => {
        try {
            await axios.post('http://localhost:8000/api/notificacoes/ler-todas/');
            setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
            setNaoLidas(0);
        } catch (err) {
            console.error('Erro ao marcar todas como lida:', err);
        }
    };

    const deletarNotificacao = async (id: number) => {
        try {
            await axios.post(`http://localhost:8000/api/notificacoes/${id}/deletar/`);
            setNotificacoes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error('Erro ao deletar:', err);
        }
    };

    const deletarLidas = async () => {
        try {
            await axios.post('http://localhost:8000/api/notificacoes/deletar-lidas/');
            setNotificacoes((prev) => prev.filter((n) => !n.lida));
        } catch (err) {
            console.error('Erro ao deletar lidas:', err);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setAberto(!aberto)}
                className="relative p-2 hover:bg-accent rounded-lg transition-colors"
                title="Notificações"
            >
                <Bell className="w-5 h-5 text-foreground" />
                {naoLidas > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                        {naoLidas > 99 ? '99+' : naoLidas}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {aberto && (
                <div className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-xl border border-border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Notificações</h3>
                        <button
                            onClick={() => setAberto(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Notificações List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notificacoes.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            notificacoes.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`border-b border-border p-3 hover:bg-accent/50 transition-colors ${!notif.lida ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-sm font-medium ${!notif.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notif.titulo}
                                                </h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${tipoBadges[notif.tipo]}`}>
                                                    {notif.tipo}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-1">{notif.dias_atras}</p>
                                            {notif.acao_requerida && (
                                                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Requer ação</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 ml-2">
                                            {!notif.lida && (
                                                <button
                                                    onClick={() => marcarComoLida(notif.id)}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                    title="Marcar como lida"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deletarNotificacao(notif.id)}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    {notificacoes.length > 0 && (
                        <div className="flex gap-2 p-3 border-t border-border bg-muted/50 rounded-b-xl">
                            <button
                                onClick={marcarTodasComoLida}
                                disabled={naoLidas === 0 || carregando}
                                className="flex-1 text-xs font-medium text-primary hover:bg-primary/10 py-2 rounded-md disabled:text-muted-foreground disabled:hover:bg-transparent transition-colors"
                            >
                                Marcar tudo como lido
                            </button>
                            <button
                                onClick={deletarLidas}
                                className="flex-1 text-xs font-medium text-destructive hover:bg-destructive/10 py-2 rounded-md transition-colors"
                            >
                                Limpar lidas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
