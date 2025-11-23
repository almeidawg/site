import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

// Aqui você já declara a função `ObrasPage`, não há necessidade de duplicar
export default function ObrasPage() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarObras = async () => {
      try {
        const { data, error } = await supabase
          .from("obras")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setObras(data);
      } catch (error) {
        console.error("Erro ao carregar obras:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarObras();
  }, []);

  if (loading) return <p>Carregando obras...</p>;

  return (
    <div>
      <h1>Obras</h1>
      {obras.length === 0 ? (
        <p>Nenhuma obra cadastrada.</p>
      ) : (
        <ul>
          {obras.map((obra) => (
            <li key={obra.id}>
              <strong>{obra.nome}</strong> - {obra.status} 
              <br />
              <em>{obra.cidade}, {obra.estado}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
