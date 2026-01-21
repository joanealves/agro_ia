import React, { useState } from 'react';

interface FazendaFormProps {
    onSubmit?: (data: any) => void;
    initialData?: any;
}

const FazendaForm: React.FC<FazendaFormProps> = ({ onSubmit, initialData }) => {
    const [nome, setNome] = useState(initialData?.nome || '');
    const [localizacao, setLocalizacao] = useState(initialData?.localizacao || '');
    const [latitude, setLatitude] = useState(initialData?.latitude || '');
    const [longitude, setLongitude] = useState(initialData?.longitude || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // TODO: Integrar com API real
            if (onSubmit) {
                onSubmit({ nome, localizacao, latitude, longitude });
            }
            // Limpar formulário após submit
            setNome('');
            setLocalizacao('');
            setLatitude('');
            setLongitude('');
        } catch (err: any) {
            setError('Erro ao salvar fazenda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold">Cadastrar Fazenda</h2>
            <div>
                <label className="block font-medium">Nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
                <label className="block font-medium">Localização</label>
                <input type="text" value={localizacao} onChange={e => setLocalizacao(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block font-medium">Latitude</label>
                    <input type="number" value={latitude} onChange={e => setLatitude(e.target.value)} className="border rounded px-2 py-1 w-full" />
                </div>
                <div className="flex-1">
                    <label className="block font-medium">Longitude</label>
                    <input type="number" value={longitude} onChange={e => setLongitude(e.target.value)} className="border rounded px-2 py-1 w-full" />
                </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
            </button>
        </form>
    );
};

export default FazendaForm;
