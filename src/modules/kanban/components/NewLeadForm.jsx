import { useState } from "react";

export function NewLeadForm({ onCreate }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [origem, setOrigem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      setSubmitting(true);
      await onCreate({
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        origem: origem.trim() || null,
      });

      setNome("");
      setTelefone("");
      setEmail("");
      setOrigem("");
    } catch (err) {
      console.error("Erro ao criar lead:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100"
    >
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do lead *"
        required
        className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
      />

      <input
        type="tel"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="Telefone / WhatsApp"
        className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
      />

      <div className="flex gap-2">
        <input
          type="text"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          placeholder="Origem (Instagram, Indicação...)"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm w-full"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {submitting ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
