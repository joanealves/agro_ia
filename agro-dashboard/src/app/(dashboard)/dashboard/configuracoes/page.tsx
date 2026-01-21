"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Separator } from "../../../../components/ui/separator";
import { useToast } from "../../../../hooks/use-toast";
import { Bell, Globe, Palette, Settings as SettingsIcon } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface ConfiguracoesUsuario {
  idioma: string;
  fuso_horario: string;
  unidade_area: string;
  unidade_temperatura: string;
  formato_data: string;
  tema: string;
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  notificacoes_whatsapp: boolean;
  notificacoes_sms: boolean;
  horario_inicio_notif: string;
  horario_fim_notif: string;
  limite_temp_alta: number;
  limite_temp_baixa: number;
  limite_umidade_baixa: number;
  limite_precipitacao_alta: number;
  alerta_umidade_alta: number;
  alerta_vento_forte: number;
  alerta_geada: boolean;
  dashboard_widgets: string[];
}

const configuracoesPadrao: ConfiguracoesUsuario = {
  idioma: "pt-BR",
  fuso_horario: "America/Sao_Paulo",
  unidade_area: "hectare",
  unidade_temperatura: "celsius",
  formato_data: "DD/MM/YYYY",
  tema: "system",
  notificacoes_email: true,
  notificacoes_push: true,
  notificacoes_whatsapp: false,
  notificacoes_sms: false,
  horario_inicio_notif: "06:00",
  horario_fim_notif: "22:00",
  limite_temp_alta: 35,
  limite_temp_baixa: 10,
  limite_umidade_baixa: 30,
  limite_precipitacao_alta: 50,
  alerta_umidade_alta: 90,
  alerta_vento_forte: 60,
  alerta_geada: true,
  dashboard_widgets: ["clima", "pragas", "irrigacao", "produtividade"],
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracoesUsuario>(configuracoesPadrao);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Carregar configurações do usuário
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    setLoading(true);
    try {
      // TODO: Implementar chamada API
      // const response = await api.get("/api/configuracoes/");
      // setConfig(response.data);
      
      // Por enquanto, usar localStorage como mock
      const configSalva = localStorage.getItem("agroia_config");
      if (configSalva) {
        setConfig(JSON.parse(configSalva));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function salvarConfiguracoes() {
    setSaving(true);
    try {
      // TODO: Implementar chamada API
      // await api.put("/api/configuracoes/", config);
      
      // Por enquanto, usar localStorage como mock
      localStorage.setItem("agroia_config", JSON.stringify(config));
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function atualizarConfig(campo: keyof ConfiguracoesUsuario, valor: any) {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no AgroIA
        </p>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="aparencia">
            <Palette className="h-4 w-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="regional">
            <Globe className="h-4 w-4 mr-2" />
            Regional
          </TabsTrigger>
        </TabsList>

        {/* ABA: GERAL */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Gerais</CardTitle>
              <CardDescription>
                Configure as preferências básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unidade_area">Unidade de Área</Label>
                  <Select
                    value={config.unidade_area}
                    onValueChange={(value) => atualizarConfig("unidade_area", value)}
                  >
                    <SelectTrigger id="unidade_area">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hectare">Hectare (ha)</SelectItem>
                      <SelectItem value="alqueire">Alqueire</SelectItem>
                      <SelectItem value="acre">Acre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade_temperatura">Unidade de Temperatura</Label>
                  <Select
                    value={config.unidade_temperatura}
                    onValueChange={(value) => atualizarConfig("unidade_temperatura", value)}
                  >
                    <SelectTrigger id="unidade_temperatura">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Limites de Alerta Climático</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="limite_temp_alta">Temperatura Alta (°C)</Label>
                    <Input
                      id="limite_temp_alta"
                      type="number"
                      value={config.limite_temp_alta}
                      onChange={(e) =>
                        atualizarConfig("limite_temp_alta", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limite_temp_baixa">Temperatura Baixa (°C)</Label>
                    <Input
                      id="limite_temp_baixa"
                      type="number"
                      value={config.limite_temp_baixa}
                      onChange={(e) =>
                        atualizarConfig("limite_temp_baixa", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limite_umidade_baixa">Umidade Baixa (%)</Label>
                    <Input
                      id="limite_umidade_baixa"
                      type="number"
                      value={config.limite_umidade_baixa}
                      onChange={(e) =>
                        atualizarConfig("limite_umidade_baixa", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alerta_vento_forte">Vento Forte (km/h)</Label>
                    <Input
                      id="alerta_vento_forte"
                      type="number"
                      value={config.alerta_vento_forte}
                      onChange={(e) =>
                        atualizarConfig("alerta_vento_forte", parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="alerta_geada">Alerta de Geada</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre risco de geada
                    </p>
                  </div>
                  <Switch
                    id="alerta_geada"
                    checked={config.alerta_geada}
                    onCheckedChange={(checked) => atualizarConfig("alerta_geada", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha como e quando deseja receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif_email">Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    id="notif_email"
                    checked={config.notificacoes_email}
                    onCheckedChange={(checked) =>
                      atualizarConfig("notificacoes_email", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif_push">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações em tempo real no navegador
                    </p>
                  </div>
                  <Switch
                    id="notif_push"
                    checked={config.notificacoes_push}
                    onCheckedChange={(checked) =>
                      atualizarConfig("notificacoes_push", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif_whatsapp">Notificações via WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas críticos via WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="notif_whatsapp"
                    checked={config.notificacoes_whatsapp}
                    onCheckedChange={(checked) =>
                      atualizarConfig("notificacoes_whatsapp", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif_sms">Notificações via SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas urgentes via SMS
                    </p>
                  </div>
                  <Switch
                    id="notif_sms"
                    checked={config.notificacoes_sms}
                    onCheckedChange={(checked) =>
                      atualizarConfig("notificacoes_sms", checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Horário de Notificações</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Defina o horário em que deseja receber notificações
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="horario_inicio">Início</Label>
                    <Input
                      id="horario_inicio"
                      type="time"
                      value={config.horario_inicio_notif}
                      onChange={(e) =>
                        atualizarConfig("horario_inicio_notif", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horario_fim">Fim</Label>
                    <Input
                      id="horario_fim"
                      type="time"
                      value={config.horario_fim_notif}
                      onChange={(e) =>
                        atualizarConfig("horario_fim_notif", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: APARÊNCIA */}
        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema</Label>
                <Select
                  value={config.tema}
                  onValueChange={(value) => atualizarConfig("tema", value)}
                >
                  <SelectTrigger id="tema">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: REGIONAL */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Regionais</CardTitle>
              <CardDescription>
                Ajuste idioma, fuso horário e formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select
                    value={config.idioma}
                    onValueChange={(value) => atualizarConfig("idioma", value)}
                  >
                    <SelectTrigger id="idioma">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuso_horario">Fuso Horário</Label>
                  <Select
                    value={config.fuso_horario}
                    onValueChange={(value) => atualizarConfig("fuso_horario", value)}
                  >
                    <SelectTrigger id="fuso_horario">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">
                        São Paulo (BRT/BRST)
                      </SelectItem>
                      <SelectItem value="America/Manaus">Manaus (AMT)</SelectItem>
                      <SelectItem value="America/Fortaleza">Fortaleza (BRT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato_data">Formato de Data</Label>
                  <Select
                    value={config.formato_data}
                    onValueChange={(value) => atualizarConfig("formato_data", value)}
                  >
                    <SelectTrigger id="formato_data">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={carregarConfiguracoes}
          disabled={loading || saving}
        >
          Cancelar
        </Button>
        <Button onClick={salvarConfiguracoes} disabled={loading || saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}