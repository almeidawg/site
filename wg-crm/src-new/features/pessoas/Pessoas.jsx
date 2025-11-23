
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Plus, Contact, User, Briefcase, Truck, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NovaPessoaDialog from '@/components/pessoas/NovaPessoaDialog';

const Pessoas = () => {
  const [entities, setEntities] = useLocalStorage('crm_entities', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState(null);
  const { toast } = useToast();

  const handleOpenDialog = (entity = null) => {
    setEntityToEdit(entity);
    setDialogOpen(true);
  };
  
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
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entity.nome_razao_social}</td>
                <td className="px-6 py-4">{entity.cpf_cnpj}</td>
                <td className="px-6 py-4">{entity.email}</td>
                <td className="px-6 py-4">{entity.telefone}</td>
                <td className="px-6 py-4">{entity.endereco?.cidade}/{entity.endereco?.uf}</td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(entity)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1><Contact className="inline-block mr-2" /> Pessoas</h1>
          <p className="text-muted-foreground mt-1">Gestão unificada de Clientes, Colaboradores e Fornecedores.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={20} className="mr-2" />
          Nova Pessoa
        </Button>
      </div>

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
    </div>
    <NovaPessoaDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        setEntities={setEntities}
        entityToEdit={entityToEdit}
    />
    </>
  );
};

export default Pessoas;
