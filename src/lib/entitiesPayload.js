const toNull = (v) =>
      v === undefined || v === null || v === "" || v === "." || v === "null" ? null : v;

    const onlyDigits = (s) =>
      s ? String(s).replace(/\D/g, "") : null;

    const normalizeTipoPessoa = (v) =>
      v === "pf" || v === "pj" ? v : null;

    export function buildEntityPayload(form) {
      const {
        categoria_nome,
        setor_nome,
        procedencia_nome,
        dados_bancarios,
        ...raw
      } = form || {};

      const end = form?.endereco
        ? {
            cep: onlyDigits(form.endereco.cep),
            uf: toNull(form.endereco.uf),
            cidade: toNull(form.endereco.cidade),
            logradouro: toNull(form.endereco.logradouro),
            numero: toNull(form.endereco.numero),
            complemento: toNull(form.endereco.complemento),
            bairro: toNull(form.endereco.bairro),
          }
        : null;

      const payload = {
        id: toNull(raw.id),
        tipo: raw.tipo || "cliente",
        nome_razao_social: raw.nome_razao_social?.trim(),
        nome_fantasia: toNull(raw.nome_fantasia)?.trim(),
        cpf_cnpj: toNull(onlyDigits(raw.cpf_cnpj)),
        rg_ie: toNull(raw.rg_ie),
        email: toNull(raw.email),
        telefone: toNull(raw.telefone),
        setor_categoria: toNull(raw.setor_categoria),
        ativo: raw.ativo ?? true,
        endereco: end,
        observacoes: toNull(raw.observacoes),
        procedencia_id: toNull(raw.procedencia_id),
        setor_id: toNull(raw.setor_id),
        categoria_id: toNull(raw.categoria_id),
        tipo_pessoa: normalizeTipoPessoa(raw.tipo_pessoa),
        equipe: toNull(raw.equipe),
        especificador: toNull(raw.especificador),
        drive_link: toNull(raw.drive_link),
        responsavel_id: toNull(raw.responsavel_id),
        obra_mesmo_endereco: raw.obra_mesmo_endereco ?? true,
        endereco_obra: raw.obra_mesmo_endereco === false ? (raw.endereco_obra || null) : null,
      };

      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) {
          delete payload[k];
        }
      });
      
      // Do not send ID for new entries, let Supabase handle it with the default value
      if (!payload.id) {
          delete payload.id;
      }

      return payload;
    }
