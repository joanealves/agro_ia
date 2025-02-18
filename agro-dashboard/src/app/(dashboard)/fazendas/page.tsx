import { useEffect, useState } from 'react';
import { MapPin, Trash2, Edit, Plus, Search } from 'lucide-react';
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

interface Farm {
  id: number;
  nome: string;
  localizacao: string;
  latitude: number;
  longitude: number;
}

export default function FarmManagement() {
  const [farms, setFarms] = useState<Farm[]>([
    {
      id: 1,
      nome: "Fazenda São João",
      localizacao: "São Paulo, SP",
      latitude: -23.5505,
      longitude: -46.6333
    },
    {
      id: 2,
      nome: "Fazenda Santa Maria",
      localizacao: "Ribeirão Preto, SP",
      latitude: -21.1704,
      longitude: -47.8103
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredFarms = farms.filter(farm =>
    farm.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Gerenciamento de Fazendas</h1>
          <p className="text-muted-foreground">Gerencie suas fazendas e propriedades</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar fazendas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[250px]"
            />
          </div>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Fazenda
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Lista de Fazendas
          </CardTitle>
          <CardDescription>
            {filteredFarms.length} fazendas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <div className="bg-muted/50">
                <div className="grid grid-cols-4 px-4 py-3">
                  <div className="font-medium">Nome</div>
                  <div className="font-medium">Localização</div>
                  <div className="font-medium">Coordenadas</div>
                  <div className="font-medium text-right">Ações</div>
                </div>
              </div>
              {/* Table Body */}
              <div className="divide-y divide-gray-200 bg-white">
                {filteredFarms.map((farm) => (
                  <div key={farm.id} className="grid grid-cols-4 px-4 py-3">
                    <div className="font-medium">{farm.nome}</div>
                    <div>{farm.localizacao}</div>
                    <div>
                      {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Nova Fazenda</AlertDialogTitle>
            <AlertDialogDescription>
              Preencha os dados da nova fazenda
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Nome da fazenda" />
            <Input placeholder="Localização" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Latitude" type="number" step="0.000001" />
              <Input placeholder="Longitude" type="number" step="0.000001" />
            </div>
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