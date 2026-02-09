
import React from 'react';
import { useFazendas } from '../../hooks/useFazendas';

const FazendaList = () => {
    const { fazendas, loading, error } = useFazendas();

    if (loading) return <div>Carregando fazendas...</div>;
    if (error) return <div>Erro ao carregar fazendas.</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Fazendas</h2>
            <ul className="space-y-2">
                {fazendas.length === 0 && <li>Nenhuma fazenda cadastrada.</li>}
                {fazendas.map((fazenda: any) => (
                    <li key={fazenda.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="font-semibold">{fazenda.nome}</span>
                            {fazenda.localizacao && (
                                <span className="ml-2 text-gray-500">({fazenda.localizacao})</span>
                            )}
                        </div>
                        <div className="mt-2 md:mt-0 flex gap-2">
                            {/* Botões de ação: editar, excluir, visualizar talhões */}
                            <button className="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded">Excluir</button>
                            <button className="bg-green-500 text-white px-2 py-1 rounded">Talhões</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FazendaList;
