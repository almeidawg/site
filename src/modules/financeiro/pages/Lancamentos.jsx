import { useLancamentos } from "../hooks/useLancamentos";
import { FinanceiroActions } from "../components/FinanceiroActions";

export default function LancamentosPage() {
  const { lancamentos } = useLancamentos();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Lançamentos Financeiros</h1>

      <FinanceiroActions />

      <table className="w-full border-collapse mt-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Data</th>
            <th className="p-2">Descrição</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Valor</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((l) => (
            <tr key={l.id} className="border-b">
              <td className="p-2">{l.data}</td>
              <td className="p-2">{l.descricao}</td>
              <td className="p-2">{l.clientes?.nome}</td>
              <td className="p-2">{l.tipo}</td>
              <td className="p-2">R$ {l.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
