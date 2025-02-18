import { useEffect, useState } from 'react';
import { Bug, Plus, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Pest {
  id: number;
  nome: string;
  descricao: string;
  status: 'pendente' | 'resolvido';
  data_criacao: string;
  fazenda: {
    id: number;
    nome: string;
  };
}

export default function PestManagement() {
  const [pests, setPests] = useState<Pest[]>([
    {
      id: 1,
      nome: "Lagarta do Cartucho",
      descricao: "Identificada na plantação de milho, setor norte",
      status: "pendente",
      data_criacao: "2025-02-18T10:00:00",
      fazenda: {
        id: 1,
        nome: "Fazenda São João"
      }
    },
    {
      id: 2,
      nome: "Ferrugem",
      descricao: "Detectada na plantação de soja, área sul",
      status: "resolvido",
      data_criacao: "2025-02-17T14:30:00",
      fazenda: {
        id: 1,
        nome: "Fazenda São João"
      }
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPests = pests.filter(pest => {
    const matchesSearch = pest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pest.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || pest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'resolvido') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-64 w-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Controle de Pragas</h1>
          <p className="text-muted-foreground">Monitore e gerencie pragas em suas plantações</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar pragas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="resolvido">Resolvidos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Ocorrência
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            Ocorrências de Pragas
          </CardTitle>
          <CardDescription>
            {filteredPests.length} ocorrências encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPests.map((pest) => (
              <div
                key={pest.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {getStatusIcon(pest.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{pest.nome}</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getRelativeTime(pest.data_criacao)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{pest.descricao}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Fazenda: {pest.fazenda.nome}
                    </span>
                    <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {pest.status === 'pendente' ? 'Pendente' : 'Resolvido'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Nova Ocorrência</AlertDialogTitle>
            <AlertDialogDescription>
              Preencha os dados da nova ocorrência de praga
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Nome da praga" />
            <Input placeholder="Descrição" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a fazenda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Fazenda São João</SelectItem>
                <SelectItem value="2">Fazenda Santa Maria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowDialog(false)}>
              Salvar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}