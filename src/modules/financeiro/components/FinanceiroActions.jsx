import { financeiroService } from "../services/financeiroService";

export function FinanceiroActions() {
  async function importClientes() {
    await financeiroService.importarClientes();
    alert("Clientes importados com sucesso.");
  }

  async function exportClientes() {
    await financeiroService.exportarClientes();
    alert("Clientes exportados.");
  }

  async function exportLancamentos() {
    await financeiroService.exportarLancamentos();
    alert("Lançamentos exportados.");
  }

  return (
    <div className="flex gap-4 p-4">
      <button onClick={importClientes} className="bg-blue-600 text-white px-4 py-2 rounded">
        Importar Clientes
      </button>

      <button onClick={exportClientes} className="bg-green-600 text-white px-4 py-2 rounded">
        Exportar Clientes
      </button>

      <button onClick={exportLancamentos} className="bg-purple-600 text-white px-4 py-2 rounded">
        Exportar Lançamentos
      </button>
    </div>
  );
}
