// src/cronograma/MedicaoForm.jsx
import React, { useState } from "react";

export default function MedicaoForm({ onSubmit }) {
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(valor), obs);
        setValor("");
        setObs("");
      }}
      className="space-y-3 p-4 border rounded-xl bg-white shadow-sm"
    >
      <div className="flex flex-col">
        <label className="text-xs text-slate-600 font-semibold">
          Valor (R$)
        </label>
        <input
          type="number"
          step="0.01"
          className="border rounded px-2 py-1 text-sm"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-slate-600 font-semibold">
          Observação
        </label>
        <textarea
          className="border rounded px-2 py-1 text-sm"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        ></textarea>
      </div>

      <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm">
        Registrar Medição
      </button>
    </form>
  );
}
