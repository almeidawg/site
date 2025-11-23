import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import SearchSelect from '@/components/shared/SearchSelect';
    import { buscarProfissionais, buscarClientes, listarCategorias, criarRegistro, listarRegistros, listarPropostasDoCliente, listarObrasDoCliente, aprovarEGerarLancamento } from '@/api/registros';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { format } from 'date-fns';

    export default function RegistroPage() {
      const { toast } = useToast();
      const getInitialFormState = () => ({
        profissional: null,
        cliente: null,
        proposta_id: null,
        obra_id: null,
        categoria_id: null,
        data: new Date().toISOString().slice(0, 10),
        descricao: '',
        quantidade: 1,
        valor_unitario: '',
        aprovado: false,
        gerar_lancamento: false,
      });

      const [form, setForm] = useState(getInitialFormState());
      const [categorias, setCategorias] = useState([]);
      const [propostas, setPropostas] = useState([]);
      const [obras, setObras] = useState([]);
      const [lista, setLista] = useState([]);
      const [loading, setLoading] = useState(false);
      const [loadingList, setLoadingList] = useState(true);

      const refreshList = useCallback(async () => {
        setLoadingList(true);
        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const items = await listarRegistros({ from: thirtyDaysAgo.toISOString().slice(0, 10) });
          setLista(items);
        } catch (error) {
          toast({ title: 'Erro ao carregar registros', description: error.message, variant: 'destructive' });
        } finally {
          setLoadingList(false);
        }
      }, [toast]);

      useEffect(() => {
        const fetchData = async () => {
          try {
            const [cats] = await Promise.all([
              listarCategorias(),
              refreshList()
            ]);
            setCategorias(cats);
          } catch (error) {
            toast({ title: 'Erro ao carregar dados iniciais', description: error.message, variant: 'destructive' });
          }
        };
        fetchData();
      }, [refreshList, toast]);

      const handleFormChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
      };
      
      const handleSelectChange = (key, value) => {
        setForm(prev => ({...prev, [key]: value === 'null' ? null : value}));
      };

      useEffect(() => {
        const fetchPropostasEObras = async () => {
          if (form.cliente?.id) {
            try {
              const [propostasData, obrasData] = await Promise.all([
                listarPropostasDoCliente(form.cliente.id),
                listarObrasDoCliente(form.cliente.id),
              ]);
              setPropostas(propostasData);
              setObras(obrasData);
            } catch (error) {
              toast({ title: 'Erro ao buscar propostas e obras', description: error.message, variant: 'destructive' });
            }
          } else {
            setPropostas([]);
            setObras([]);
            handleFormChange('proposta_id', null);
            handleFormChange('obra_id', null);
          }
        };
        fetchPropostasEObras();
      }, [form.cliente, toast]);


      const handleSave = async () => {
        if (!form.profissional?.id || !form.cliente?.id || !form.categoria_id || !form.data) {
          toast({ title: 'Campos obrigatórios', description: 'Profissional, Cliente, Categoria e Data são obrigatórios.', variant: 'destructive' });
          return;
        }
        setLoading(true);
        try {
          const payload = {
            profissional_id: form.profissional.id,
            cliente_id: form.cliente.id,
            proposta_id: form.proposta_id,
            obra_id: form.obra_id,
            data: form.data,
            categoria_id: form.categoria_id,
            descricao: form.descricao,
            quantidade: Number(form.quantidade) || 1,
            valor_unitario: form.valor_unitario ? Number(form.valor_unitario) : null,
          };
          
          const newRecord = await criarRegistro(payload);

          if(form.aprovado || form.gerar_lancamento) {
            await aprovarEGerarLancamento(newRecord.id, form.aprovado, form.gerar_lancamento);
          }

          toast({ title: 'Sucesso!', description: 'Registro de trabalho salvo.' });
          setForm(getInitialFormState());
          refreshList();
        } catch (error) {
          toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };
      
      const handleClear = () => {
        setForm(getInitialFormState());
      }

      return (
        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Novo Registro de Horas/Trabalho</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Profissional* (Colaborador/Fornecedor)</Label>
                <SearchSelect
                  placeholder="Buscar profissional..."
                  fetcher={async (term) => {
                    const r = await buscarProfissionais(term);
                    return r.map(x => ({ id: x.id, label: x.nome_razao_social || 'N/A' }));
                  }}
                  onSelect={(prof) => handleFormChange('profissional', prof)}
                  initialLabel={form.profissional ? form.profissional.label : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente*</Label>
                <SearchSelect
                  placeholder="Buscar cliente..."
                  fetcher={async (term) => {
                    const r = await buscarClientes(term);
                    return r.map(x => ({ id: x.id, label: x.nome_razao_social || 'N/A' }));
                  }}
                  onSelect={(cli) => handleFormChange('cliente', cli)}
                   initialLabel={form.cliente ? form.cliente.label : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data*</Label>
                <Input type="date" id="data" value={form.data} onChange={e => handleFormChange('data', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria_id">Categoria*</Label>
                <Select onValueChange={(value) => handleSelectChange('categoria_id', value)} value={form.categoria_id || 'null'}>
                  <SelectTrigger id="categoria_id">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Selecione...</SelectItem>
                    {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposta_id">Proposta (opcional)</Label>
                <Select onValueChange={(value) => handleSelectChange('proposta_id', value)} value={form.proposta_id || 'null'} disabled={!form.cliente}>
                  <SelectTrigger id="proposta_id">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Nenhuma</SelectItem>
                    {propostas.map(p => <SelectItem key={p.id} value={p.id}>{p.codigo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obra_id">Obra (opcional)</Label>
                <Select onValueChange={(value) => handleSelectChange('obra_id', value)} value={form.obra_id || 'null'} disabled={!form.cliente}>
                  <SelectTrigger id="obra_id">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Nenhuma</SelectItem>
                    {obras.map(o => <SelectItem key={o.id} value={o.id}>{o.titulo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <Label htmlFor="descricao">Descrição dos serviços</Label>
                <Textarea id="descricao" value={form.descricao} onChange={e => handleFormChange('descricao', e.target.value)} placeholder="Ex: Montagem de armários, ajustes de portas..." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade (dias)</Label>
                <Input type="number" id="quantidade" value={form.quantidade} onChange={e => handleFormChange('quantidade', e.target.value)} step="0.5" min="0.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
                <Input type="number" id="valor_unitario" value={form.valor_unitario} onChange={e => handleFormChange('valor_unitario', e.target.value)} placeholder="150.00" />
              </div>
              <div className="flex items-center space-x-6 pt-6">
                  <div className="flex items-center space-x-2">
                      <Checkbox id="aprovado" checked={form.aprovado} onCheckedChange={(checked) => handleFormChange('aprovado', checked)} />
                      <Label htmlFor="aprovado">Aprovado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="gerar_lancamento" checked={form.gerar_lancamento} onCheckedChange={(checked) => handleFormChange('gerar_lancamento', checked)} />
                      <Label htmlFor="gerar_lancamento">Gerar Lançamento Financeiro</Label>
                  </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="ghost" onClick={handleClear} disabled={loading}>Limpar</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Salvar Registro
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Últimos Registros (30 dias)</h3>
            <div className="overflow-auto max-h-[500px]">
              {loadingList ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="p-3 font-semibold">Data</th>
                      <th className="p-3 font-semibold">Profissional</th>
                      <th className="p-3 font-semibold">Cliente</th>
                      <th className="p-3 font-semibold">Categoria</th>
                      <th className="p-3 font-semibold text-center">Qtd</th>
                      <th className="p-3 font-semibold">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.length > 0 ? lista.map((r) => (
                      <tr key={r.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{format(new Date(r.data), 'dd/MM/yyyy')}</td>
                        <td className="p-3">{r.profissional_nome}</td>
                        <td className="p-3">{r.cliente_nome}</td>
                        <td className="p-3">{r.categoria_nome}</td>
                        <td className="p-3 text-center">{Number(r.quantidade).toLocaleString('pt-BR')}</td>
                        <td className="p-3 truncate max-w-xs">{r.descricao}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="text-center p-8 text-gray-500">Nenhum registro encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      );
    }