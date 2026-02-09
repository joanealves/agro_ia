import { useState, useEffect } from 'react';
import axios from 'axios';

export function useTalhoes(fazendaId: number) {
  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fazendaId) return;
    async function fetchTalhoes() {
      setLoading(true);
      try {
        // TODO: Ajustar URL da API
        const response = await axios.get(`/api/fazendas/${fazendaId}/talhoes/`);
        setTalhoes(response.data);
      } catch (err) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTalhoes();
  }, [fazendaId]);

  return { talhoes, loading, error };
}
