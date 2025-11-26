import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEntities } from '@/hooks/useEntities.js';
import { Button } from '@/components/ui/button';
import { Plus, Contact, User, Briefcase, Truck, Edit, Loader2, FileText, Mail, MessageCircle, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { parseCsvFile, validateCsvColumns } from '@/lib/csvImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NovaPessoaDialog from '@/components/pessoas/NovaPessoaDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import jsPDF from 'jspdf';

const TEMPLATE_PATHS_PESSOAS = '/templates/pessoas-import.csv';
const EXPECTED_COLUMNS_PESSOAS = [
  'tipo',
  'nome_razao_social',
  'cpf_cnpj',
  'email',
  'telefone',
  'endereco',
  'cidade',
  'estado',
  'categoria',
  'ativo',
];

const Pessoas = () => {
  const { entities, loading, error, refetch, deleteEntity } = useEntities();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState(null);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handleOpenDialog = (entity = null) => {
    setEntityToEdit(entity);
    setDialogOpen(true);
  };

  const initials = (name) => (name || '').split(' ').slice(0, 2).map(p => p[0] || '').join('').toUpperCase();

  const gerarFicha = (entity) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Ficha Cadastral - ${entity.nome || entity.nome_razao_social}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Tipo: ${entity.tipo}`, 14, 30);
    doc.text(`Nome/Razão: ${entity.nome || entity.nome_razao_social}`, 14, 36);
    doc.text(`CPF/CNPJ: ${entity.cpf_cnpj || '-'}`, 14, 42);
    doc.text(`Email: ${entity.email || '-'}`, 14, 48);
    doc.text(`Telefone: ${entity.telefone || '-'}`, 14, 54);
    doc.text(`Cidade/UF: ${(entity.cidade || '-')}/${entity.estado || '-'}`, 14, 60);
    doc.save(`ficha-${entity.nome || 'cliente'}.pdf`);
  };

  const shareText = (entity) => encodeURIComponent(
    `Cadastro:\n${entity.nome || entity.nome_razao_social}\nTipo: ${entity.tipo}\nCPF/CNPJ: ${entity.cpf_cnpj || '-'}\nEmail: ${entity.email || '-'}\nTelefone: ${entity.telefone || '-'}\nCidade/UF: ${(entity.cidade || '-')}/${entity.estado || '-'}`
  );

  const handleDelete = async (entity) => {
    const confirmDelete = window.confirm(`Excluir ${entity.nome || entity.nome_razao_social}?`);
    if (!confirmDelete) return;
    try {
      await deleteEntity(entity.id);
      toast({ title: 'Excluído', description: 'Cadastro removido.' });
    } catch (err) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  const handleFileImport = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = '';
      const { columns, rows } = await parseCsvFile(file);
      const missing = validateCsvColumns(columns, EXPECTED_COLUMNS_PESSOAS);
      if (missing.length) {
        toast({
          variant: 'destructive',
          title: 'Formato inválido',
          description: `Faltam colunas: ${missing.join(', ')}`,
        });
        return;
      }
      toast({
        title: 'Importação validada',
        description: `${rows.length} linhas prontas para importar.`,
      });
    },
    [toast]
  );

  const renderList = (tipo) => {
    const filteredEntities = entities.filter(e => e.tipo === tipo);
    if (filteredEntities.length === 0) {
      return <p className="text-center text-muted-foreground py-8">Nenhum(a) {tipo} cadastrado(a).</p>;
    }
    return (
      <div className="overflow-x-auto glass-effect rounded-xl">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
            <tr>
              <th scope="col" className="px-6 py-3">Avatar</th>
              <th scope="col" className="px-6 py-3">Nome / Razão Social</th>
              <th scope="col" className="px-6 py-3">CPF / CNPJ</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Telefone</th>
              <th scope="col" className="px-6 py-3">Cidade/UF</th>
              <th scope="col" className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntities.map((entity, index) => (
              <motion.tr
                key={entity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white/30 border-b hover:bg-gray-50/50"
              >
                <td className="px-6 py-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={entity.avatar_url} alt={entity.nome || entity.nome_razao_social} />
                    <AvatarFallback>{initials(entity.nome || entity.nome_razao_social)}</AvatarFallback>
                  </Avatar>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entity.nome || entity.nome_razao_social}</td>
                <td className="px-6 py-4">{entity.cpf_cnpj}</td>
                <td className="px-6 py-4">{entity.email}</td>
                <td className="px-6 py-4">{entity.telefone}</td>
                <td className="px-6 py-4">{entity.cidade}/{entity.estado}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="Ficha PDF" onClick={() => gerarFicha(entity)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Email" onClick={() => window.location.href = `mailto:?subject=Cadastro&body=${shareText(entity)}`}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="WhatsApp" onClick={() => window.open(`https://wa.me/?text=${shareText(entity)}`, '_blank', 'noopener,noreferrer')}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => handleOpenDialog(entity)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDelete(entity)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (error) {
    toast({
      title: "Erro ao carregar dados",
      description: error,
      variant: "destructive"
    });
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1><Contact className="inline-block mr-2" /> Pessoas</h1>
            <p className="text-muted-foreground mt-1">Gestão unificada de Clientes, Colaboradores e Fornecedores.</p>
          </div>
          <Button onClick={() => handleOpenDialog()} disabled={loading}>
            {loading ? (
              <Loader2 size={20} className="mr-2 animate-spin" />
            ) : (
              <Plus size={20} className="mr-2" />
            )}
            Nova Pessoa
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Importar CSV
          </Button>
          <a href={TEMPLATE_PATHS_PESSOAS} download className="text-sm text-slate-600 hover:text-primary">
            Modelo de Pessoas
          </a>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
          <p className="text-xs text-slate-500 italic">
            Estrutura: tipo, nome_razao_social, cpf_cnpj, email, telefone, endereco, cidade, estado, categoria, ativo
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando pessoas...</span>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Tabs defaultValue="cliente" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cliente"><User className="mr-2 h-4 w-4" /> Clientes</TabsTrigger>
                <TabsTrigger value="colaborador"><Briefcase className="mr-2 h-4 w-4" /> Colaboradores</TabsTrigger>
                <TabsTrigger value="fornecedor"><Truck className="mr-2 h-4 w-4" /> Fornecedores</TabsTrigger>
              </TabsList>
              <TabsContent value="cliente" className="mt-4">
                {renderList('cliente')}
              </TabsContent>
              <TabsContent value="colaborador" className="mt-4">
                {renderList('colaborador')}
              </TabsContent>
              <TabsContent value="fornecedor" className="mt-4">
                {renderList('fornecedor')}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
      <NovaPessoaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={refetch}
        entityToEdit={entityToEdit}
      />
    </>
  );
};

export default Pessoas;
