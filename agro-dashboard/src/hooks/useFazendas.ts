import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFazendas() {
  const [fazendas, setFazendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFazendas() {
      setLoading(true);
      try {
        // TODO: Ajustar URL da API
        const response = await axios.get('/api/fazendas/');
        setFazendas(response.data);
      } catch (err) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchFazendas();
  }, []);

  return { fazendas, loading, error };
}
