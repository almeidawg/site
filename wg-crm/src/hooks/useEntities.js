import { useState, useEffect } from 'react';
import { supabase } from '../lib/customSupabaseClient';

/**
 * Hook personalizado para gerenciar entidades (pessoas) no Supabase
 * @param {string|null} tipo - Filtrar por tipo: 'cliente', 'colaborador', 'fornecedor', 'especificador', 'lead'
 */
const isAvatarSourceMissing = (err) =>
  err?.code === 'PGRST204' && err?.message?.includes('avatar_source');

const stripAvatarSource = (payload) => {
  const { avatar_source, ...rest } = payload;
  return rest;
};

export const useEntities = (tipo = null) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persistCache = (list) => {
    try {
      window.localStorage.setItem('crm_entities', JSON.stringify(list || []));
    } catch (err) {
      console.error('Erro ao salvar cache local de entities:', err);
    }
  };

  const fetchEntities = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('entities')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setEntities(data || []);
      persistCache(data);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar entities:', err);
      setError(err.message);
      try {
        const cached = JSON.parse(window.localStorage.getItem('crm_entities') || '[]');
        if (cached.length) {
          setEntities(cached);
          return cached;
        }
      } catch (cacheErr) {
        console.error('Erro ao ler cache local de entities:', cacheErr);
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEntity = async (entityData) => {
    try {
      setError(null);

      const dataToInsert = {
        tipo: entityData.tipo,
        nome: entityData.nome_razao_social || entityData.nome,
        email: entityData.email,
        telefone: entityData.telefone,
        cpf_cnpj: entityData.cpf_cnpj,
        tipo_pessoa: entityData.tipo_pessoa || 'PF',
        nome_fantasia: entityData.nome_fantasia,
        rg_ie: entityData.rg_ie,
        cep: entityData.cep,
        logradouro: entityData.logradouro,
        numero: entityData.numero,
        complemento: entityData.complemento,
        bairro: entityData.bairro,
        cidade: entityData.cidade,
        estado: entityData.estado,
        observacoes: entityData.observacoes,
        endereco: entityData.endereco,
        dados: entityData.dados || {},
        avatar_url: entityData.avatar_url,
        avatar_source: entityData.avatar_source,
        obra_mesmo_endereco: entityData.obra_mesmo_endereco ?? true,
        endereco_obra: entityData.endereco_obra || null,
        ativo: true,
      };

      const sanitizedInsert = { ...dataToInsert };
      Object.keys(sanitizedInsert).forEach((key) => {
        if (sanitizedInsert[key] === undefined) {
          delete sanitizedInsert[key];
        }
      });

      const { data, error: insertError } = await supabase.from('entities').insert([sanitizedInsert]).select().single();

      if (insertError) {
        if (isAvatarSourceMissing(insertError)) {
          const fallbackPayload = stripAvatarSource(sanitizedInsert);
          const { data: retryData, error: retryError } = await supabase.from('entities').insert([fallbackPayload]).select().single();
          if (retryError) throw retryError;
          await fetchEntities();
          return retryData;
        }
        throw insertError;
      }
      await fetchEntities();
      return data;
    } catch (err) {
      console.error('Erro ao criar entity:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateEntity = async (id, updates) => {
    try {
      setError(null);

      const dataToUpdate = {
        tipo: updates.tipo,
        nome: updates.nome_razao_social || updates.nome,
        email: updates.email,
        telefone: updates.telefone,
        cpf_cnpj: updates.cpf_cnpj,
        tipo_pessoa: updates.tipo_pessoa,
        nome_fantasia: updates.nome_fantasia,
        rg_ie: updates.rg_ie,
        cep: updates.cep,
        logradouro: updates.logradouro,
        numero: updates.numero,
        complemento: updates.complemento,
        bairro: updates.bairro,
        cidade: updates.cidade,
        estado: updates.estado,
        observacoes: updates.observacoes,
        endereco: updates.endereco,
        dados: updates.dados,
        avatar_url: updates.avatar_url,
        avatar_source: updates.avatar_source,
        obra_mesmo_endereco: updates.obra_mesmo_endereco ?? true,
        endereco_obra: updates.endereco_obra || null,
        updated_at: new Date().toISOString(),
      };

      Object.keys(dataToUpdate).forEach((key) => {
        if (dataToUpdate[key] === undefined) {
          delete dataToUpdate[key];
        }
      });

      const { data, error: updateError } = await supabase.from('entities').update(dataToUpdate).eq('id', id).select().single();

      if (updateError) {
        if (isAvatarSourceMissing(updateError)) {
          const fallbackPayload = stripAvatarSource(dataToUpdate);
          const { data: retryData, error: retryError } = await supabase.from('entities').update(fallbackPayload).eq('id', id).select().single();
          if (retryError) throw retryError;
          await fetchEntities();
          return retryData;
        }
        throw updateError;
      }
      await fetchEntities();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar entity:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteEntity = async (id) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('entities')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (deleteError) throw deleteError;
      await fetchEntities();
    } catch (err) {
      console.error('Erro ao deletar entity:', err);
      setError(err.message);
      throw err;
    }
  };

  const getEntityById = async (id) => {
    try {
      const { data, error: fetchError } = await supabase.from('entities').select('*').eq('id', id).single();
      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error('Erro ao buscar entity por ID:', err);
      return null;
    }
  };

  const getEntitiesByCpfCnpj = async (cpfCnpj) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('entities')
        .select('*')
        .eq('cpf_cnpj', cpfCnpj)
        .eq('ativo', true);
      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar entity por CPF/CNPJ:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [tipo]);

  return {
    entities,
    loading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    refetch: fetchEntities,
    getEntityById,
    getEntitiesByCpfCnpj,
  };
};
