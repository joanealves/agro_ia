import React, { useState } from 'react';

interface TalhaoFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

const TalhaoForm: React.FC<TalhaoFormProps> = ({ onSubmit, initialData }) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [cultura, setCultura] = useState(initialData?.cultura || '');
  const [safra, setSafra] = useState(initialData?.safra || '');
  const [responsavel, setResponsavel] = useState(initialData?.responsavel || '');
  const [poligono, setPoligono] = useState(initialData?.poligono || null); // GeoJSON ou similar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: Integrar com API real
      if (onSubmit) {
        onSubmit({ nome, cultura, safra, responsavel, poligono });
      }
      setNome('');
      setCultura('');
      setSafra('');
      setResponsavel('');
      setPoligono(null);
    } catch (err: any) {
      setError('Erro ao salvar talhão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-lg font-bold">Cadastrar Talhão</h2>
      <div>
        <label className="block font-medium">Nome</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Cultura</label>
        <input type="text" value={cultura} onChange={e => setCultura(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Safra</label>
        <input type="text" value={safra} onChange={e => setSafra(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Responsável Técnico</label>
        <input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block font-medium">Polígono (área)</label>
        {/* Aqui entrará o editor de polígono no mapa */}
        <div className="border rounded p-2 bg-gray-100 text-gray-600 text-sm mb-2">Editor de polígono (mapa) será implementado aqui</div>
        {/* Exemplo: <MapPolygonEditor value={poligono} onChange={setPoligono} /> */}
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

export default TalhaoForm;
