import { useState } from "react";
import { useParams } from "react-router-dom";
import { useClienteObra } from "../hooks/useClienteObra";

import { ClienteTabs } from "../components/ClienteTabs";
import { ClienteObraVisaoGeral } from "../components/ClienteObraVisaoGeral";
import { ClienteObraProjeto } from "../components/ClienteObraProjeto";
import { ClienteObraEngenharia } from "../components/ClienteObraEngenharia";
import { ClienteObraMarcenaria } from "../components/ClienteObraMarcenaria";
import { ClienteObraDocumentos } from "../components/ClienteObraDocumentos";
import { ClienteObraFotosFinais } from "../components/ClienteObraFotosFinais";
import DiarioObraCarousel from "../components/DiarioObraCarousel";

const TABS = [
  { id: "visao-geral", label: "Visão Geral" },
  { id: "projeto", label: "Projeto" },
  { id: "engenharia", label: "Engenharia" },
  { id: "marcenaria", label: "Marcenaria" },
  { id: "diario-obra", label: "Diário de Obra" },
  { id: "documentos", label: "Documentos" },
  { id: "fotos-finais", label: "Fotos Finais" },
];

export default function ClienteObraPage() {
  const { obraId } = useParams();
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { obra, loading } = useClienteObra(obraId || "");

  if (loading) return <div>Carregando...</div>;
  if (!obra) return <div>Obra não encontrada.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            Área do Cliente
          </div>
          <div className="text-2xl font-semibold">{obra.nome_obra}</div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <ClienteTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "visao-geral" && <ClienteObraVisaoGeral obra={obra} />}
        {activeTab === "projeto" && <ClienteObraProjeto />}
        {activeTab === "engenharia" && <ClienteObraEngenharia />}
        {activeTab === "marcenaria" && <ClienteObraMarcenaria />}
        {activeTab === "diario-obra" && <DiarioObraCarousel obraId={obra.id} />}
        {activeTab === "documentos" && <ClienteObraDocumentos />}
        {activeTab === "fotos-finais" && <ClienteObraFotosFinais />}
      </main>
    </div>
  );
}
