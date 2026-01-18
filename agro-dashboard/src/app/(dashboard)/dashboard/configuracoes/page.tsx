// "use client";

// // =============================================================================
// // PÁGINA DE CONFIGURAÇÕES - Configurações do sistema
// // =============================================================================

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../../components/ui/input";
// import { Label } from "../../../../components/ui/label";
// import { Switch } from "../../../../components/ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
// import { Separator } from "../../../../components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
// import { 
//   Settings, 
//   Bell, 
//   Globe, 
//   Palette,
//   Shield,
//   Database,
//   Save,
//   RefreshCw
// } from "lucide-react";
// import { useTheme } from "next-themes";

// // =============================================================================
// // COMPONENTE PRINCIPAL
// // =============================================================================

// export default function ConfiguracoesPage() {
//   const { theme, setTheme } = useTheme();
//   const [saving, setSaving] = useState(false);

//   // Estado das configurações
//   const [config, setConfig] = useState({
//     // Notificações
//     notificacoesEmail: true,
//     notificacoesWhatsapp: false,
//     notificacoesPush: true,
//     alertasClima: true,
//     alertasPragas: true,
//     alertasIrrigacao: true,
    
//     // Preferências
//     idioma: "pt-BR",
//     unidadeArea: "hectare",
//     unidadeTemperatura: "celsius",
//     formatoData: "DD/MM/YYYY",
//     fusoHorario: "America/Sao_Paulo",
    
//     // Limites e alertas
//     limiteTemperaturaAlta: 35,
//     limiteTemperaturaBaixa: 10,
//     limiteUmidadeBaixa: 30,
//     limitePrecipitacaoAlta: 50,
//   });

//   const handleSave = async () => {
//     setSaving(true);
//     // Simular salvamento
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     setSaving(false);
//     // TODO: Implementar salvamento real via API
//   };

//   // =============================================================================
//   // RENDER
//   // =============================================================================

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold flex items-center gap-2">
//             <Settings className="h-8 w-8 text-gray-500" />
//             Configurações
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Gerencie as configurações do sistema
//           </p>
//         </div>
        
//         <Button onClick={handleSave} disabled={saving}>
//           {saving ? (
//             <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//           ) : (
//             <Save className="h-4 w-4 mr-2" />
//           )}
//           Salvar Alterações
//         </Button>
//       </div>

//       <Tabs defaultValue="notificacoes" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
//           <TabsTrigger value="notificacoes" className="flex items-center gap-2">
//             <Bell className="h-4 w-4" />
//             <span className="hidden sm:inline">Notificações</span>
//           </TabsTrigger>
//           <TabsTrigger value="preferencias" className="flex items-center gap-2">
//             <Globe className="h-4 w-4" />
//             <span className="hidden sm:inline">Preferências</span>
//           </TabsTrigger>
//           <TabsTrigger value="aparencia" className="flex items-center gap-2">
//             <Palette className="h-4 w-4" />
//             <span className="hidden sm:inline">Aparência</span>
//           </TabsTrigger>
//           <TabsTrigger value="alertas" className="flex items-center gap-2">
//             <Shield className="h-4 w-4" />
//             <span className="hidden sm:inline">Alertas</span>
//           </TabsTrigger>
//         </TabsList>

//         {/* Notificações */}
//         <TabsContent value="notificacoes">
//           <Card>
//             <CardHeader>
//               <CardTitle>Preferências de Notificação</CardTitle>
//               <CardDescription>
//                 Configure como deseja receber notificações do sistema
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <h3 className="text-sm font-medium">Canais de Notificação</h3>
                
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Notificações por Email</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Receba alertas importantes no seu email
//                     </p>
//                   </div>
//                   <Switch
//                     checked={config.notificacoesEmail}
//                     onCheckedChange={(checked) => 
//                       setConfig({...config, notificacoesEmail: checked})
//                     }
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Notificações por WhatsApp</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Receba alertas críticos via WhatsApp
//                     </p>
//                   </div>
//                   <Switch
//                     checked={config.notificacoesWhatsapp}
//                     onCheckedChange={(checked) => 
//                       setConfig({...config, notificacoesWhatsapp: checked})
//                     }
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Notificações Push</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Receba notificações no navegador
//                     </p>
//                   </div>
//                   <Switch
//                     checked={config.notificacoesPush}
//                     onCheckedChange={(checked) => 
//                       setConfig({...config, notificacoesPush: checked})
//                     }
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h3 className="text-sm font-medium">Tipos de Alerta</h3>
                
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Alertas Climáticos</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Geada, seca, excesso de chuva
//                     </p>
//                   </div>
//                   <Switch
//                     checked={config.alertasClima}
//                     onCheckedChange={(checked) => 
//                       setConfig({...config, alertasClima: checked})
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Alertas de Pragas</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Detecção e infestações
//                     </p>
//                   </div>
//                   <Switch
//                     checked={config.alertasPragas}
//                     onCheckedChange={(checked) => 
//                       setConfig({...config, alertasPragas: checked})
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Alertas de Irrigação</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Lembretes e sugestões
//                     </p>
//                   </div>
//                   <Switch
//                     checked={config.alertasIrrigacao}
//                     onCheckedChange={(checked) => 
//                       setConfig({...config, alertasIrrigacao: checked})
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Preferências */}
//         <TabsContent value="preferencias">
//           <Card>
//             <CardHeader>
//               <CardTitle>Preferências Regionais</CardTitle>
//               <CardDescription>
//                 Configure idioma, unidades e formatos
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Idioma</Label>
//                   <Select 
//                     value={config.idioma} 
//                     onValueChange={(v) => setConfig({...config, idioma: v})}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
//                       <SelectItem value="en-US">English (US)</SelectItem>
//                       <SelectItem value="es">Español</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Fuso Horário</Label>
//                   <Select 
//                     value={config.fusoHorario} 
//                     onValueChange={(v) => setConfig({...config, fusoHorario: v})}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
//                       <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
//                       <SelectItem value="America/Cuiaba">Cuiabá (GMT-4)</SelectItem>
//                       <SelectItem value="America/Fortaleza">Fortaleza (GMT-3)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Unidade de Área</Label>
//                   <Select 
//                     value={config.unidadeArea} 
//                     onValueChange={(v) => setConfig({...config, unidadeArea: v})}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="hectare">Hectare (ha)</SelectItem>
//                       <SelectItem value="alqueire_paulista">Alqueire Paulista</SelectItem>
//                       <SelectItem value="alqueire_mineiro">Alqueire Mineiro</SelectItem>
//                       <SelectItem value="acre">Acre</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Unidade de Temperatura</Label>
//                   <Select 
//                     value={config.unidadeTemperatura} 
//                     onValueChange={(v) => setConfig({...config, unidadeTemperatura: v})}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="celsius">Celsius (°C)</SelectItem>
//                       <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Formato de Data</Label>
//                   <Select 
//                     value={config.formatoData} 
//                     onValueChange={(v) => setConfig({...config, formatoData: v})}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
//                       <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
//                       <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Aparência */}
//         <TabsContent value="aparencia">
//           <Card>
//             <CardHeader>
//               <CardTitle>Aparência</CardTitle>
//               <CardDescription>
//                 Personalize a aparência do sistema
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <Label>Tema</Label>
//                 <div className="grid grid-cols-3 gap-4">
//                   <button
//                     onClick={() => setTheme("light")}
//                     className={`p-4 rounded-lg border-2 transition-colors ${
//                       theme === "light" ? "border-primary" : "border-muted"
//                     }`}
//                   >
//                     <div className="h-20 rounded bg-white border mb-2" />
//                     <p className="text-sm font-medium">Claro</p>
//                   </button>
                  
//                   <button
//                     onClick={() => setTheme("dark")}
//                     className={`p-4 rounded-lg border-2 transition-colors ${
//                       theme === "dark" ? "border-primary" : "border-muted"
//                     }`}
//                   >
//                     <div className="h-20 rounded bg-slate-900 border mb-2" />
//                     <p className="text-sm font-medium">Escuro</p>
//                   </button>
                  
//                   <button
//                     onClick={() => setTheme("system")}
//                     className={`p-4 rounded-lg border-2 transition-colors ${
//                       theme === "system" ? "border-primary" : "border-muted"
//                     }`}
//                   >
//                     <div className="h-20 rounded bg-gradient-to-r from-white to-slate-900 border mb-2" />
//                     <p className="text-sm font-medium">Sistema</p>
//                   </button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Alertas */}
//         <TabsContent value="alertas">
//           <Card>
//             <CardHeader>
//               <CardTitle>Limites de Alerta</CardTitle>
//               <CardDescription>
//                 Configure os limites para disparo automático de alertas
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid gap-6 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Temperatura Alta (°C)</Label>
//                   <Input
//                     type="number"
//                     value={config.limiteTemperaturaAlta}
//                     onChange={(e) => setConfig({
//                       ...config, 
//                       limiteTemperaturaAlta: parseInt(e.target.value)
//                     })}
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     Alerta quando temperatura exceder este valor
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Temperatura Baixa (°C)</Label>
//                   <Input
//                     type="number"
//                     value={config.limiteTemperaturaBaixa}
//                     onChange={(e) => setConfig({
//                       ...config, 
//                       limiteTemperaturaBaixa: parseInt(e.target.value)
//                     })}
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     Alerta de geada quando abaixo deste valor
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Umidade Baixa (%)</Label>
//                   <Input
//                     type="number"
//                     value={config.limiteUmidadeBaixa}
//                     onChange={(e) => setConfig({
//                       ...config, 
//                       limiteUmidadeBaixa: parseInt(e.target.value)
//                     })}
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     Alerta de seca quando abaixo deste valor
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Precipitação Alta (mm/dia)</Label>
//                   <Input
//                     type="number"
//                     value={config.limitePrecipitacaoAlta}
//                     onChange={(e) => setConfig({
//                       ...config, 
//                       limitePrecipitacaoAlta: parseInt(e.target.value)
//                     })}
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     Alerta de excesso de chuva
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }













// "use client";

// // =============================================================================
// // PÁGINA DE CONFIGURAÇÕES - AgroIA Dashboard
// // Sprint 0 - Criar página que estava faltando (erro 404)
// // =============================================================================

// import { useState, useEffect } from "react";
// import { 
//   Settings, 
//   Bell, 
//   Globe, 
//   Moon, 
//   Sun, 
//   Save, 
//   RefreshCw,
//   User,
//   Lock,
//   Database,
//   Leaf
// } from "lucide-react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../../components/ui/input";
// import { Label } from "../../../../components/ui/label";
// import { Switch } from "../../../../components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from "../../../../components/ui/select";
// import { Separator } from "../../../../components/ui/separator";
// import { useToast } from "../../../../hooks/use-toast";

// // =============================================================================
// // TIPOS
// // =============================================================================

// interface ConfiguracoesGerais {
//   unidadeArea: "hectares" | "alqueires" | "acres";
//   unidadeTemperatura: "celsius" | "fahrenheit";
//   idioma: "pt-BR" | "en-US" | "es";
//   tema: "light" | "dark" | "system";
// }

// interface ConfiguracoesNotificacoes {
//   emailAtivo: boolean;
//   pushAtivo: boolean;
//   whatsappAtivo: boolean;
//   alertasPragas: boolean;
//   alertasClima: boolean;
//   alertasIrrigacao: boolean;
//   resumoDiario: boolean;
//   resumoSemanal: boolean;
// }

// interface ConfiguracoesCultura {
//   culturaPadrao: string;
//   safraAtual: string;
//   limiteAlertaPraga: "baixo" | "medio" | "alto";
// }

// // =============================================================================
// // COMPONENTE PRINCIPAL
// // =============================================================================

// export default function ConfiguracoesPage() {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("geral");

//   // Estados das configurações
//   const [configGerais, setConfigGerais] = useState<ConfiguracoesGerais>({
//     unidadeArea: "hectares",
//     unidadeTemperatura: "celsius",
//     idioma: "pt-BR",
//     tema: "dark",
//   });

//   const [configNotificacoes, setConfigNotificacoes] = useState<ConfiguracoesNotificacoes>({
//     emailAtivo: true,
//     pushAtivo: false,
//     whatsappAtivo: false,
//     alertasPragas: true,
//     alertasClima: true,
//     alertasIrrigacao: true,
//     resumoDiario: false,
//     resumoSemanal: true,
//   });

//   const [configCultura, setConfigCultura] = useState<ConfiguracoesCultura>({
//     culturaPadrao: "soja",
//     safraAtual: "2025/2026",
//     limiteAlertaPraga: "medio",
//   });

//   // Carregar configurações salvas
//   useEffect(() => {
//     const savedConfig = localStorage.getItem("agroia_config");
//     if (savedConfig) {
//       try {
//         const parsed = JSON.parse(savedConfig);
//         if (parsed.gerais) setConfigGerais(parsed.gerais);
//         if (parsed.notificacoes) setConfigNotificacoes(parsed.notificacoes);
//         if (parsed.cultura) setConfigCultura(parsed.cultura);
//       } catch (e) {
//         console.error("Erro ao carregar configurações:", e);
//       }
//     }
//   }, []);

//   // Salvar configurações
//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       // Salvar no localStorage (futuro: enviar para API)
//       const config = {
//         gerais: configGerais,
//         notificacoes: configNotificacoes,
//         cultura: configCultura,
//         updatedAt: new Date().toISOString(),
//       };
//       localStorage.setItem("agroia_config", JSON.stringify(config));

//       toast({
//         title: "Configurações salvas",
//         description: "Suas preferências foram atualizadas com sucesso.",
//       });
//     } catch (error) {
//       toast({
//         title: "Erro ao salvar",
//         description: "Não foi possível salvar as configurações.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Resetar configurações
//   const handleReset = () => {
//     setConfigGerais({
//       unidadeArea: "hectares",
//       unidadeTemperatura: "celsius",
//       idioma: "pt-BR",
//       tema: "dark",
//     });
//     setConfigNotificacoes({
//       emailAtivo: true,
//       pushAtivo: false,
//       whatsappAtivo: false,
//       alertasPragas: true,
//       alertasClima: true,
//       alertasIrrigacao: true,
//       resumoDiario: false,
//       resumoSemanal: true,
//     });
//     setConfigCultura({
//       culturaPadrao: "soja",
//       safraAtual: "2025/2026",
//       limiteAlertaPraga: "medio",
//     });
//     toast({
//       title: "Configurações resetadas",
//       description: "Valores padrão restaurados.",
//     });
//   };

//   return (
//     <div className="flex-1 space-y-6 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
//             <Settings className="h-8 w-8 text-primary" />
//             Configurações
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Gerencie as preferências do sistema AgroIA
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleReset} disabled={loading}>
//             <RefreshCw className="mr-2 h-4 w-4" />
//             Resetar
//           </Button>
//           <Button onClick={handleSave} disabled={loading}>
//             <Save className="mr-2 h-4 w-4" />
//             {loading ? "Salvando..." : "Salvar"}
//           </Button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
//           <TabsTrigger value="geral" className="flex items-center gap-2">
//             <Globe className="h-4 w-4" />
//             <span className="hidden sm:inline">Geral</span>
//           </TabsTrigger>
//           <TabsTrigger value="notificacoes" className="flex items-center gap-2">
//             <Bell className="h-4 w-4" />
//             <span className="hidden sm:inline">Notificações</span>
//           </TabsTrigger>
//           <TabsTrigger value="cultura" className="flex items-center gap-2">
//             <Leaf className="h-4 w-4" />
//             <span className="hidden sm:inline">Cultura</span>
//           </TabsTrigger>
//           <TabsTrigger value="sistema" className="flex items-center gap-2">
//             <Database className="h-4 w-4" />
//             <span className="hidden sm:inline">Sistema</span>
//           </TabsTrigger>
//         </TabsList>

//         {/* Tab: Configurações Gerais */}
//         <TabsContent value="geral" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Preferências Gerais</CardTitle>
//               <CardDescription>
//                 Configure unidades de medida, idioma e tema do sistema
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Unidade de Área */}
//               <div className="grid gap-2">
//                 <Label htmlFor="unidadeArea">Unidade de Área</Label>
//                 <Select 
//                   value={configGerais.unidadeArea} 
//                   onValueChange={(v) => setConfigGerais(prev => ({ ...prev, unidadeArea: v as typeof prev.unidadeArea }))}
//                 >
//                   <SelectTrigger id="unidadeArea">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="hectares">Hectares (ha)</SelectItem>
//                     <SelectItem value="alqueires">Alqueires</SelectItem>
//                     <SelectItem value="acres">Acres</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <p className="text-sm text-muted-foreground">
//                   Define a unidade padrão para exibição de áreas
//                 </p>
//               </div>

//               <Separator />

//               {/* Unidade de Temperatura */}
//               <div className="grid gap-2">
//                 <Label htmlFor="unidadeTemperatura">Unidade de Temperatura</Label>
//                 <Select 
//                   value={configGerais.unidadeTemperatura} 
//                   onValueChange={(v) => setConfigGerais(prev => ({ ...prev, unidadeTemperatura: v as typeof prev.unidadeTemperatura }))}
//                 >
//                   <SelectTrigger id="unidadeTemperatura">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="celsius">Celsius (°C)</SelectItem>
//                     <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Separator />

//               {/* Idioma */}
//               <div className="grid gap-2">
//                 <Label htmlFor="idioma">Idioma</Label>
//                 <Select 
//                   value={configGerais.idioma} 
//                   onValueChange={(v) => setConfigGerais(prev => ({ ...prev, idioma: v as typeof prev.idioma }))}
//                 >
//                   <SelectTrigger id="idioma">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
//                     <SelectItem value="en-US">English (US)</SelectItem>
//                     <SelectItem value="es">Español</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Separator />

//               {/* Tema */}
//               <div className="grid gap-2">
//                 <Label>Tema</Label>
//                 <div className="flex items-center gap-4">
//                   <Button
//                     variant={configGerais.tema === "light" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setConfigGerais(prev => ({ ...prev, tema: "light" }))}
//                   >
//                     <Sun className="mr-2 h-4 w-4" />
//                     Claro
//                   </Button>
//                   <Button
//                     variant={configGerais.tema === "dark" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setConfigGerais(prev => ({ ...prev, tema: "dark" }))}
//                   >
//                     <Moon className="mr-2 h-4 w-4" />
//                     Escuro
//                   </Button>
//                   <Button
//                     variant={configGerais.tema === "system" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setConfigGerais(prev => ({ ...prev, tema: "system" }))}
//                   >
//                     Sistema
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tab: Notificações */}
//         <TabsContent value="notificacoes" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Canais de Notificação</CardTitle>
//               <CardDescription>
//                 Escolha como deseja receber alertas e atualizações
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>E-mail</Label>
//                   <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.emailAtivo}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, emailAtivo: v }))}
//                 />
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>Push (Navegador)</Label>
//                   <p className="text-sm text-muted-foreground">Notificações no navegador</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.pushAtivo}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, pushAtivo: v }))}
//                 />
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>WhatsApp</Label>
//                   <p className="text-sm text-muted-foreground">Alertas críticos via WhatsApp (futuro)</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.whatsappAtivo}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, whatsappAtivo: v }))}
//                   disabled
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Tipos de Alertas</CardTitle>
//               <CardDescription>
//                 Selecione quais alertas você deseja receber
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>Alertas de Pragas</Label>
//                   <p className="text-sm text-muted-foreground">Notificar sobre novas pragas detectadas</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.alertasPragas}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, alertasPragas: v }))}
//                 />
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>Alertas Climáticos</Label>
//                   <p className="text-sm text-muted-foreground">Avisos sobre condições climáticas adversas</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.alertasClima}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, alertasClima: v }))}
//                 />
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>Alertas de Irrigação</Label>
//                   <p className="text-sm text-muted-foreground">Lembretes e status de irrigação</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.alertasIrrigacao}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, alertasIrrigacao: v }))}
//                 />
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label>Resumo Semanal</Label>
//                   <p className="text-sm text-muted-foreground">Receber resumo semanal por e-mail</p>
//                 </div>
//                 <Switch
//                   checked={configNotificacoes.resumoSemanal}
//                   onCheckedChange={(v) => setConfigNotificacoes(prev => ({ ...prev, resumoSemanal: v }))}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tab: Cultura */}
//         <TabsContent value="cultura" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Configurações de Cultura</CardTitle>
//               <CardDescription>
//                 Defina padrões para suas culturas e safras
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="culturaPadrao">Cultura Padrão</Label>
//                 <Select 
//                   value={configCultura.culturaPadrao} 
//                   onValueChange={(v) => setConfigCultura(prev => ({ ...prev, culturaPadrao: v }))}
//                 >
//                   <SelectTrigger id="culturaPadrao">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="soja">Soja</SelectItem>
//                     <SelectItem value="milho">Milho</SelectItem>
//                     <SelectItem value="cafe">Café</SelectItem>
//                     <SelectItem value="cana">Cana-de-açúcar</SelectItem>
//                     <SelectItem value="algodao">Algodão</SelectItem>
//                     <SelectItem value="feijao">Feijão</SelectItem>
//                     <SelectItem value="trigo">Trigo</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <p className="text-sm text-muted-foreground">
//                   Cultura selecionada por padrão ao criar novos registros
//                 </p>
//               </div>

//               <Separator />

//               <div className="grid gap-2">
//                 <Label htmlFor="safraAtual">Safra Atual</Label>
//                 <Select 
//                   value={configCultura.safraAtual} 
//                   onValueChange={(v) => setConfigCultura(prev => ({ ...prev, safraAtual: v }))}
//                 >
//                   <SelectTrigger id="safraAtual">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="2024/2025">2024/2025</SelectItem>
//                     <SelectItem value="2025/2026">2025/2026</SelectItem>
//                     <SelectItem value="2026/2027">2026/2027</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Separator />

//               <div className="grid gap-2">
//                 <Label htmlFor="limiteAlerta">Limite de Alerta de Pragas</Label>
//                 <Select 
//                   value={configCultura.limiteAlertaPraga} 
//                   onValueChange={(v) => setConfigCultura(prev => ({ ...prev, limiteAlertaPraga: v as typeof prev.limiteAlertaPraga }))}
//                 >
//                   <SelectTrigger id="limiteAlerta">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="baixo">Baixo - Alertar em qualquer ocorrência</SelectItem>
//                     <SelectItem value="medio">Médio - Alertar apenas níveis médio/alto</SelectItem>
//                     <SelectItem value="alto">Alto - Alertar apenas níveis críticos</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <p className="text-sm text-muted-foreground">
//                   Define quando você será notificado sobre pragas
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tab: Sistema */}
//         <TabsContent value="sistema" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Informações do Sistema</CardTitle>
//               <CardDescription>
//                 Dados técnicos e versão da aplicação
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label className="text-muted-foreground">Versão</Label>
//                   <p className="font-mono">1.0.0-beta</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">Build</Label>
//                   <p className="font-mono">2026.01.15</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">Frontend</Label>
//                   <p className="font-mono">Next.js 15</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">Backend</Label>
//                   <p className="font-mono">Django 5.x</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">Banco de Dados</Label>
//                   <p className="font-mono">Supabase (PostgreSQL)</p>
//                 </div>
//                 <div>
//                   <Label className="text-muted-foreground">Ambiente</Label>
//                   <p className="font-mono">{process.env.NODE_ENV || "development"}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Cache e Dados</CardTitle>
//               <CardDescription>
//                 Gerenciar dados armazenados localmente
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Button 
//                 variant="outline" 
//                 className="w-full"
//                 onClick={() => {
//                   localStorage.removeItem("agroia_config");
//                   toast({ title: "Cache limpo", description: "Configurações locais removidas." });
//                 }}
//               >
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Limpar Cache Local
//               </Button>
//               <p className="text-sm text-muted-foreground text-center">
//                 Isso irá remover todas as configurações salvas localmente
//               </p>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
































'use client';

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import { 
  Settings, 
  Bell, 
  Sun, 
  Moon, 
  Monitor,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  Clock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// ================================================================================
// TIPOS
// ================================================================================

interface Configuracao {
  id?: number;
  usuario_id?: string;
  idioma: string;
  fuso_horario: string;
  tema: 'light' | 'dark' | 'system';
  unidade_area: string;
  unidade_temperatura: string;
  unidade_velocidade: string;
  unidade_precipitacao: string;
  formato_data: string;
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  notificacoes_whatsapp: boolean;
  notificacoes_sms: boolean;
  horario_inicio_notif: string;
  horario_fim_notif: string;
  alerta_temp_alta: number;
  alerta_temp_baixa: number;
  alerta_umidade_baixa: number;
  alerta_umidade_alta: number;
  alerta_precipitacao_alta: number;
  alerta_vento_forte: number;
  alerta_geada: boolean;
  dashboard_widgets: string[];
  fazenda_padrao_id: number | null;
}

interface Fazenda {
  id: number;
  nome: string;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  
  const [config, setConfig] = useState<Configuracao>({
    idioma: 'pt-BR',
    fuso_horario: 'America/Sao_Paulo',
    tema: 'system',
    unidade_area: 'hectare',
    unidade_temperatura: 'celsius',
    unidade_velocidade: 'km/h',
    unidade_precipitacao: 'mm',
    formato_data: 'DD/MM/YYYY',
    notificacoes_email: true,
    notificacoes_push: true,
    notificacoes_whatsapp: false,
    notificacoes_sms: false,
    horario_inicio_notif: '06:00',
    horario_fim_notif: '22:00',
    alerta_temp_alta: 35,
    alerta_temp_baixa: 10,
    alerta_umidade_baixa: 30,
    alerta_umidade_alta: 90,
    alerta_precipitacao_alta: 50,
    alerta_vento_forte: 60,
    alerta_geada: true,
    dashboard_widgets: ['clima', 'pragas', 'irrigacao', 'produtividade'],
    fazenda_padrao_id: null,
  });

  // Carregar configurações
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar configurações
        const configRes = await api.get('/api/configuracoes/');
        if (configRes.data) {
          setConfig(configRes.data);
        }
        
        // Carregar fazendas para o select
        const fazendasRes = await api.get('/api/fazendas/');
        setFazendas(fazendasRes.data || []);
        
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Salvar configurações
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await api.patch('/api/configuracoes/atualizar/', config);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Atualizar campo
  const updateConfig = (field: keyof Configuracao, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Aplicar tema
  useEffect(() => {
    if (config.tema === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (config.tema === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [config.tema]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configurações
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Personalize sua experiência no AgroIA
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Aparência */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Aparência
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tema
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'light', label: 'Claro', icon: Sun },
                  { value: 'dark', label: 'Escuro', icon: Moon },
                  { value: 'system', label: 'Sistema', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateConfig('tema', value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      config.tema === value
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idioma
              </label>
              <select
                value={config.idioma}
                onChange={(e) => updateConfig('idioma', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Fuso Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fuso Horário
              </label>
              <select
                value={config.fuso_horario}
                onChange={(e) => updateConfig('fuso_horario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Cuiaba">Cuiabá (GMT-4)</option>
                <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
              </select>
            </div>

            {/* Formato de Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formato de Data
              </label>
              <select
                value={config.formato_data}
                onChange={(e) => updateConfig('formato_data', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </section>

        {/* Unidades de Medida */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Unidades de Medida
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Área
              </label>
              <select
                value={config.unidade_area}
                onChange={(e) => updateConfig('unidade_area', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="hectare">Hectare (ha)</option>
                <option value="alqueire_paulista">Alqueire Paulista</option>
                <option value="alqueire_mineiro">Alqueire Mineiro</option>
                <option value="acre">Acre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperatura
              </label>
              <select
                value={config.unidade_temperatura}
                onChange={(e) => updateConfig('unidade_temperatura', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Velocidade do Vento
              </label>
              <select
                value={config.unidade_velocidade}
                onChange={(e) => updateConfig('unidade_velocidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="km/h">km/h</option>
                <option value="m/s">m/s</option>
                <option value="mph">mph</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precipitação
              </label>
              <select
                value={config.unidade_precipitacao}
                onChange={(e) => updateConfig('unidade_precipitacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="mm">Milímetros (mm)</option>
                <option value="in">Polegadas (in)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notificações */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { field: 'notificacoes_email', label: 'E-mail' },
                { field: 'notificacoes_push', label: 'Push (navegador)' },
                { field: 'notificacoes_whatsapp', label: 'WhatsApp' },
                { field: 'notificacoes_sms', label: 'SMS' },
              ].map(({ field, label }) => (
                <label
                  key={field}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={config[field as keyof Configuracao] as boolean}
                    onChange={(e) => updateConfig(field as keyof Configuracao, e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário de Início das Notificações
                </label>
                <input
                  type="time"
                  value={config.horario_inicio_notif}
                  onChange={(e) => updateConfig('horario_inicio_notif', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário de Fim das Notificações
                </label>
                <input
                  type="time"
                  value={config.horario_fim_notif}
                  onChange={(e) => updateConfig('horario_fim_notif', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Alertas Climáticos */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Alertas Climáticos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                Temp. Alta (°C)
              </label>
              <input
                type="number"
                value={config.alerta_temp_alta}
                onChange={(e) => updateConfig('alerta_temp_alta', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-500" />
                Temp. Baixa (°C)
              </label>
              <input
                type="number"
                value={config.alerta_temp_baixa}
                onChange={(e) => updateConfig('alerta_temp_baixa', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-yellow-500" />
                Umidade Baixa (%)
              </label>
              <input
                type="number"
                value={config.alerta_umidade_baixa}
                onChange={(e) => updateConfig('alerta_umidade_baixa', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Umidade Alta (%)
              </label>
              <input
                type="number"
                value={config.alerta_umidade_alta}
                onChange={(e) => updateConfig('alerta_umidade_alta', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                Precipitação Alta (mm)
              </label>
              <input
                type="number"
                value={config.alerta_precipitacao_alta}
                onChange={(e) => updateConfig('alerta_precipitacao_alta', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                Vento Forte (km/h)
              </label>
              <input
                type="number"
                value={config.alerta_vento_forte}
                onChange={(e) => updateConfig('alerta_vento_forte', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-fit">
              <input
                type="checkbox"
                checked={config.alerta_geada}
                onChange={(e) => updateConfig('alerta_geada', e.target.checked)}
                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Alertar sobre risco de geada
              </span>
            </label>
          </div>
        </section>

        {/* Fazenda Padrão */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dashboard
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fazenda Padrão (exibida ao abrir o dashboard)
            </label>
            <select
              value={config.fazenda_padrao_id || ''}
              onChange={(e) => updateConfig('fazenda_padrao_id', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as fazendas</option>
              {fazendas.map(fazenda => (
                <option key={fazenda.id} value={fazenda.id}>
                  {fazenda.nome}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>
    </div>
  );
}