import React from 'react';
import { useTalhoes } from '../../hooks/useTalhoes';

interface TalhaoListProps {
  fazendaId: number;
}

const TalhaoList: React.FC<TalhaoListProps> = ({ fazendaId }) => {
  const { talhoes, loading, error } = useTalhoes(fazendaId);

  if (!fazendaId) return <div>Selecione uma fazenda para ver os talhões.</div>;
  if (loading) return <div>Carregando talhões...</div>;
  if (error) return <div>Erro ao carregar talhões.</div>;

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Talhões</h3>
      <ul className="space-y-2">
        {talhoes.length === 0 && <li>Nenhum talhão cadastrado.</li>}
        {talhoes.map((talhao: any) => (
          <li key={talhao.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-semibold">{talhao.nome}</span>
              {talhao.cultura && (
                <span className="ml-2 text-gray-500">({talhao.cultura})</span>
              )}
            </div>
            <div className="mt-2 md:mt-0 flex gap-2">
              {/* Botões de ação: editar, excluir, histórico */}
              <button className="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
              <button className="bg-red-500 text-white px-2 py-1 rounded">Excluir</button>
              <button className="bg-gray-500 text-white px-2 py-1 rounded">Histórico</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TalhaoList;
