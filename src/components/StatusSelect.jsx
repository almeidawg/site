// src/components/StatusSelect.jsx
import React from "react";

const STATUS_OPTIONS = [
  { value: "nao_iniciada", label: "Não iniciada" },
  { value: "em_execucao", label: "Em execução" },
  { value: "concluida", label: "Concluída" },
  { value: "atrasada", label: "Atrasada" },
  { value: "pausada", label: "Pausada" },
];

export default function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-slate-900 focus:outline-none"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
