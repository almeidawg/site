
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import CrudManager from '@/components/config/CrudManager';
import EmpresasGrupo from '@/components/config/EmpresasGrupo';

const Configuracoes = () => {
  const { orgId, loading } = useAuth();

  if (loading || !orgId) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /> 
            <p className="ml-4 text-muted-foreground mt-4">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <Tabs defaultValue="empresas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="loja">Loja Virtual</TabsTrigger>
        </TabsList>
        <TabsContent value="empresas" className="mt-4">
          <EmpresasGrupo orgId={orgId} />
        </TabsContent>
        <TabsContent value="financeiro" className="mt-4">
          <CrudManager 
            title="Categorias Financeiras" 
            table="fin_categories" 
            columns={[
                { key: 'name', label: 'Nome' }, 
                { key: 'kind', label: 'Tipo', type: 'select', default: 'expense', options: [{value: 'expense', label: 'Despesa'}, {value: 'income', label: 'Receita'}] }
            ]} 
            orgId={orgId} 
            orderColumn="name"
          />
        </TabsContent>
        <TabsContent value="comercial" className="mt-4 space-y-4">
          <CrudManager title="Setores" table="comercial_setores" columns={[{ key: 'nome', label: 'Nome' }]} orgId={orgId} orderColumn="nome" />
          <CrudManager title="Categorias de Cliente" table="comercial_categorias" columns={[{ key: 'nome', label: 'Nome' }]} orgId={orgId} orderColumn="nome" />
          <CrudManager title="Procedências" table="comercial_procedencias" columns={[{ key: 'nome', label: 'Nome' }]} orgId={orgId} orderColumn="nome" />
        </TabsContent>
        <TabsContent value="documentos" className="mt-4">
            <CrudManager 
                title="Modelos de Documentos"
                table="document_templates"
                columns={[
                    { key: 'name', label: 'Nome do Modelo' },
                    { key: 'google_docs_url', label: 'Link do Google Doc', type: 'text' },
                    { key: 'description', label: 'Descrição', type: 'textarea' },
                ]}
                orgId={orgId}
                orderColumn="name"
            />
        </TabsContent>
        <TabsContent value="loja" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações da Loja Virtual</CardTitle>
                    <CardDescription>Gerencie as configurações da sua WG Store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A gestão de produtos, pagamentos e outras configurações da loja é feita diretamente no painel do nosso parceiro de e-commerce.</p>
                    <Button asChild className="mt-4">
                        <a href="https://wgalmeida-com-br-980024.hostingersite.com/admin" target="_blank" rel="noopener noreferrer">Acessar Painel da Loja</a>
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
