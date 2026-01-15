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













"use client";

// =============================================================================
// PÁGINA DE CONFIGURAÇÕES - Preferências do usuário e sistema
// Rota: /dashboard/admin/configuracoes
// =============================================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Separator } from "../../../../components/ui/separator";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  Thermometer,
  Droplets,
  CloudRain,
  Bug
} from "lucide-react";
import { useTheme } from "next-themes";

// =============================================================================
// TIPOS
// =============================================================================

interface NotificationSettings {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  emailAddress: string;
  whatsappNumber: string;
}

interface AlertSettings {
  tempMin: number;
  tempMax: number;
  umidadeMin: number;
  umidadeMax: number;
  precipitacaoMax: number;
  pragaAlerta: boolean;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Estados de notificação
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    whatsapp: false,
    push: true,
    emailAddress: "",
    whatsappNumber: "",
  });

  // Estados de alertas
  const [alerts, setAlerts] = useState<AlertSettings>({
    tempMin: 10,
    tempMax: 35,
    umidadeMin: 30,
    umidadeMax: 80,
    precipitacaoMax: 50,
    pragaAlerta: true,
  });

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true);
    
    // Simular salvamento (integrar com API depois)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Salvar em localStorage por enquanto
    localStorage.setItem("agroia_notifications", JSON.stringify(notifications));
    localStorage.setItem("agroia_alerts", JSON.stringify(alerts));
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? "Salvo!" : "Salvar Alterações"}
        </Button>
      </div>

      {/* Tabs de Configurações */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Thermometer className="h-4 w-4 mr-2" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Tab: Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Canais de Notificação</CardTitle>
              <CardDescription>
                Configure como deseja receber alertas e notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Label htmlFor="email-toggle">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas diretamente no seu email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-toggle"
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>

              {notifications.email && (
                <div className="ml-12 space-y-2">
                  <Label htmlFor="email-address">Endereço de Email</Label>
                  <Input
                    id="email-address"
                    type="email"
                    placeholder="seu@email.com"
                    value={notifications.emailAddress}
                    onChange={(e) => 
                      setNotifications(prev => ({ ...prev, emailAddress: e.target.value }))
                    }
                  />
                </div>
              )}

              <Separator />

              {/* WhatsApp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp-toggle">Notificações por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas via WhatsApp
                    </p>
                  </div>
                </div>
                <Switch
                  id="whatsapp-toggle"
                  checked={notifications.whatsapp}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, whatsapp: checked }))
                  }
                />
              </div>

              {notifications.whatsapp && (
                <div className="ml-12 space-y-2">
                  <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                  <Input
                    id="whatsapp-number"
                    type="tel"
                    placeholder="+55 (11) 99999-9999"
                    value={notifications.whatsappNumber}
                    onChange={(e) => 
                      setNotifications(prev => ({ ...prev, whatsappNumber: e.target.value }))
                    }
                  />
                </div>
              )}

              <Separator />

              {/* Push */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Bell className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <Label htmlFor="push-toggle">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas no navegador/app
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-toggle"
                  checked={notifications.push}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, push: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Limites de Alerta</CardTitle>
              <CardDescription>
                Configure os limites para disparo de alertas automáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temperatura */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <Label className="text-base font-medium">Temperatura (°C)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div className="space-y-2">
                    <Label htmlFor="temp-min">Mínimo</Label>
                    <Input
                      id="temp-min"
                      type="number"
                      value={alerts.tempMin}
                      onChange={(e) => 
                        setAlerts(prev => ({ ...prev, tempMin: Number(e.target.value) }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Alerta quando temperatura abaixo de {alerts.tempMin}°C
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temp-max">Máximo</Label>
                    <Input
                      id="temp-max"
                      type="number"
                      value={alerts.tempMax}
                      onChange={(e) => 
                        setAlerts(prev => ({ ...prev, tempMax: Number(e.target.value) }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Alerta quando temperatura acima de {alerts.tempMax}°C
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Umidade */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <Label className="text-base font-medium">Umidade (%)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div className="space-y-2">
                    <Label htmlFor="umidade-min">Mínimo</Label>
                    <Input
                      id="umidade-min"
                      type="number"
                      value={alerts.umidadeMin}
                      onChange={(e) => 
                        setAlerts(prev => ({ ...prev, umidadeMin: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="umidade-max">Máximo</Label>
                    <Input
                      id="umidade-max"
                      type="number"
                      value={alerts.umidadeMax}
                      onChange={(e) => 
                        setAlerts(prev => ({ ...prev, umidadeMax: Number(e.target.value) }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Precipitação */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-cyan-500" />
                  <Label className="text-base font-medium">Precipitação (mm)</Label>
                </div>
                <div className="ml-7 space-y-2">
                  <Label htmlFor="precipitacao-max">Máximo diário</Label>
                  <Input
                    id="precipitacao-max"
                    type="number"
                    className="w-[200px]"
                    value={alerts.precipitacaoMax}
                    onChange={(e) => 
                      setAlerts(prev => ({ ...prev, precipitacaoMax: Number(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Alerta quando precipitação diária acima de {alerts.precipitacaoMax}mm
                  </p>
                </div>
              </div>

              <Separator />

              {/* Pragas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Bug className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <Label htmlFor="praga-toggle">Alertas de Pragas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas quando pragas nível alto/crítico
                    </p>
                  </div>
                </div>
                <Switch
                  id="praga-toggle"
                  checked={alerts.pragaAlerta}
                  onCheckedChange={(checked) => 
                    setAlerts(prev => ({ ...prev, pragaAlerta: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Aparência */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Tema e Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setTheme("light")}
                  >
                    <div className="w-full h-20 rounded bg-white border shadow-sm" />
                    <span>Claro</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setTheme("dark")}
                  >
                    <div className="w-full h-20 rounded bg-gray-900 border border-gray-700" />
                    <span>Escuro</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setTheme("system")}
                  >
                    <div className="w-full h-20 rounded bg-gradient-to-r from-white to-gray-900 border" />
                    <span>Sistema</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button variant="outline">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}