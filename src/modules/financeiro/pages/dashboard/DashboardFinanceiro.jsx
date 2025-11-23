import { useEffect, useState } from "react";
import { supabase } from "../../../lib/customSupabaseClient";

export default function DashboardFinanceiro() {
  const [dados, setDados] = useState({
    entradas: 0,
    saídas: 0,
    saldo: 0,
    totalMes: 0,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase.rpc("dashboard_financeiro");
    if (data) setDados(data);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Dashboard Financeiro</h1>

      <div className="grid grid-cols-4 gap-6">
        <Card titulo="Entradas" valor={`R$ ${dados.entradas}`} cor="green" />
        <Card titulo="Saídas" valor={`R$ ${dados.saídas}`} cor="red" />
        <Card titulo="Saldo" valor={`R$ ${dados.saldo}`} cor="blue" />
        <Card titulo="Faturamento Mensal" valor={`R$ ${dados.totalMes}`} cor="purple" />
      </div>
    </div>
  );
}

function Card({ titulo, valor, cor }) {
  return (
    <div className={`p-6 rounded-xl shadow bg-${cor}-600 text-white`}>
      <p className="text-sm opacity-90">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
