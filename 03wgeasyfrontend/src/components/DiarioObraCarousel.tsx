import { useState } from "react";
import { useDiarioObra } from "../hooks/useDiarioObra";

export default function DiarioObraCarousel({ obraId }: { obraId: string }) {
  const { fotosPorSemana, loading } = useDiarioObra(obraId);
  const semanas = Object.keys(fotosPorSemana).sort();
  const [indexSemana, setIndexSemana] = useState(0);

  if (loading) return <div>Carregando...</div>;
  if (!semanas.length) return <div>Sem registros.</div>;

  const semana = semanas[indexSemana];
  const fotos = fotosPorSemana[semana];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <button
          disabled={indexSemana === 0}
          onClick={() => setIndexSemana(indexSemana - 1)}
        >
          ◀
        </button>

        <div className="text-lg font-semibold">{semana}</div>

        <button
          disabled={indexSemana === semanas.length - 1}
          onClick={() => setIndexSemana(indexSemana + 1)}
        >
          ▶
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="min-w-[260px] rounded-xl border overflow-hidden">
            <img src={foto.url_publica} className="w-full h-40 object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
