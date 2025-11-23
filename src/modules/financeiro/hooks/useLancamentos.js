import { useEffect, useState } from "react";
import { financeiroService } from "../services/financeiroService";

export function useLancamentos() {
  const [lancamentos, setLancamentos] = useState([]);

  async function carregar() {
    const { data } = await financeiroService.listarLancamentos();
    setLancamentos(data || []);
  }

  async function novoLancamento(payload) {
    await financeiroService.criarLancamento(payload);
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return { lancamentos, novoLancamento, carregar };
}
