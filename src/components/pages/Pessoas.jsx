
import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { PlusCircle, Loader2, Users2, Building, User, List, Search, UserCheck, Truck, Briefcase, LayoutGrid } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import FichaCliente from '@/components/pessoas/FichaCliente';
    import NovaPessoaDialog from '@/components/pessoas/NovaPessoaDialog';
    import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
    import { Input } from '@/components/ui/input';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import Especificadores from '@/components/pessoas/Especificadores';
    import ActionIcons from '@/components/shared/ActionIcons';
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger,
      } from "@/components/ui/dropdown-menu";
import { Helmet } from 'react-helmet';

    const Pessoas = () => {
        const [pessoas, setPessoas] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedPessoa, setSelectedPessoa] = useState(null);
        const [isDialogOpen, setIsDialogOpen] = useState(false);
        const [editingPessoa, setEditingPessoa] = useState(null);
        const [defaultTipo, setDefaultTipo] = useState('cliente');
        const [view, setView] = useState('todos');
        const [searchTerm, setSearchTerm] = useState('');
        const [layout, setLayout] = useState('list');
        const { toast } = useToast();

        const fetchPessoas = useCallback(async (shouldSelectFirst = false) => {
            setLoading(true);
            let query = supabase.from('v_entities_full').select('*');
            
            if (view !== 'todos' && view !== 'especificadores') {
              query = query.eq('tipo', view);
            }
            if (searchTerm) {
                query = query.or(`nome_razao_social.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                toast({ title: 'Erro ao buscar pessoas', description: error.message, variant: 'destructive' });
                setPessoas([]);
            } else {
                const filteredData = view === 'todos' ? data.filter(p => p.tipo !== 'especificador') : (view === 'especificadores' ? [] : data);
                setPessoas(filteredData);
                if (selectedPessoa) {
                  const updatedSelected = filteredData.find(p => p.id === selectedPessoa.id);
                  setSelectedPessoa(updatedSelected || null);
                } else if (shouldSelectFirst && filteredData.length > 0) {
                  setSelectedPessoa(filteredData[0]);
                } else if (filteredData.length === 0) {
                  setSelectedPessoa(null);
                }
            }
            setLoading(false);
        }, [toast, view, searchTerm, selectedPessoa?.id]);

        useEffect(() => {
            fetchPessoas(true);
        }, [view, searchTerm, fetchPessoas]);

        const handleOpenDialog = (pessoa = null, tipo = 'cliente') => {
            setDefaultTipo(tipo);
            setEditingPessoa(pessoa);
            setIsDialogOpen(true);
        };

        const handleCloseDialog = () => {
            setIsDialogOpen(false);
            setEditingPessoa(null);
        };
        
        const handleSave = () => {
            fetchPessoas(false);
            handleCloseDialog();
        };
        
        const handleUpdate = () => {
            fetchPessoas(false);
        }

        const renderListView = () => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              <div className="md:col-span-1 flex flex-col h-full">
                  <div className="flex-grow overflow-y-auto pr-2">
                      {loading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                      ) : (
                        pessoas.length > 0 ? (
                            <div className="space-y-2">
                            {pessoas.map((pessoa, index) => (
                                <motion.div
                                    key={pessoa.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${selectedPessoa?.id === pessoa.id ? 'bg-muted' : 'bg-card'}`}
                                    onClick={() => setSelectedPessoa(pessoa)}
                                >
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        {pessoa.tipo_pessoa === 'pf' ? <User className="h-4 w-4 text-sky-500"/> : <Building className="h-4 w-4 text-orange-500"/>}
                                        {pessoa.nome_razao_social}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{pessoa.email || 'Sem e-mail'}</p>
                                </motion.div>
                            ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-muted-foreground">Nenhum registro encontrado.</div>
                        )
                      )}
                  </div>
              </div>
              
              <div className="md:col-span-2 h-full overflow-y-auto">
                  <FichaCliente pessoa={selectedPessoa} onEdit={(p) => handleOpenDialog(p, p.tipo)} onUpdate={handleUpdate} />
              </div>
          </div>
        );

        const renderTableView = () => (
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader><TableRow><TableHead>Nome / Razão Social</TableHead><TableHead>Tipo</TableHead><TableHead>Email</TableHead><TableHead>Telefone</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan="5" className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : pessoas.length > 0 ? (
                            pessoas.map((pessoa) => (
                                <TableRow key={pessoa.id} onClick={() => setSelectedPessoa(pessoa)} className="cursor-pointer">
                                    <TableCell className="font-medium">{pessoa.nome_razao_social}</TableCell>
                                    <TableCell>{pessoa.tipo}</TableCell>
                                    <TableCell>{pessoa.email}</TableCell>
                                    <TableCell>{pessoa.telefone}</TableCell>
                                    <TableCell className="text-right">
                                        <ActionIcons onEdit={() => handleOpenDialog(pessoa, pessoa.tipo)} onDelete={() => { /* Implemented in Ficha */ }}/>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : ( <TableRow><TableCell colSpan="5" className="h-24 text-center">Nenhum resultado encontrado.</TableCell></TableRow> )}
                    </TableBody>
                </Table>
            </div>
        );

        const renderActiveView = () => {
            if (view === 'especificadores') return <Especificadores />;
            if (layout === 'list') return renderListView();
            if (layout === 'table' && !selectedPessoa) return renderTableView();
            if (layout === 'table' && selectedPessoa) return <FichaCliente pessoa={selectedPessoa} onEdit={(p) => handleOpenDialog(p, p.tipo)} onUpdate={handleUpdate} />;
            return renderListView();
        };

        return (
            <div className="flex flex-col h-full p-4">
                 <Helmet>
                    <title>Pessoas - Gestão de Clientes, Fornecedores, Colaboradores</title>
                    <meta name="description" content="Gerencie todos os seus clientes, fornecedores, colaboradores e especificadores em um só lugar." />
                </Helmet>
                <div className="flex items-start justify-between mb-4">
                    <div><h1 className="text-2xl font-bold flex items-center gap-2"><Users2 />Pessoas</h1><p className="text-muted-foreground">Gestão de Clientes, Fornecedores e Colaboradores</p></div>
                    <div className="flex items-center gap-2">
                         {view !== 'especificadores' && (
                             <ToggleGroup type="single" value={layout} onValueChange={(v) => { if(v) { setLayout(v); if(v === 'list' && !selectedPessoa && pessoas.length > 0) setSelectedPessoa(pessoas[0]); else if (v === 'table') setSelectedPessoa(null); }}} variant="outline">
                                <ToggleGroupItem value="list" aria-label="Ver em lista"><List className="h-4 w-4" /></ToggleGroupItem>
                                <ToggleGroupItem value="table" aria-label="Ver em tabela"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                            </ToggleGroup>
                         )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Novo</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleOpenDialog(null, 'cliente')}>
                                    <User className="mr-2 h-4 w-4" /> Novo Cliente
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenDialog(null, 'fornecedor')}>
                                    <Truck className="mr-2 h-4 w-4" /> Novo Fornecedor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenDialog(null, 'colaborador')}>
                                    <Briefcase className="mr-2 h-4 w-4" /> Novo Colaborador
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <Input placeholder="Buscar por nome ou e-mail..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow"/>
                  <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)} className="w-full max-w-xl grid grid-cols-5">
                      <ToggleGroupItem value="todos" aria-label="Todos">Todos</ToggleGroupItem>
                      <ToggleGroupItem value="cliente" aria-label="Clientes"><User className="h-4 w-4 mr-1"/> Clientes</ToggleGroupItem>
                      <ToggleGroupItem value="fornecedor" aria-label="Fornecedores"><Truck className="h-4 w-4 mr-1"/> Fornecedores</ToggleGroupItem>
                       <ToggleGroupItem value="colaborador" aria-label="Colaboradores"><Briefcase className="h-4 w-4 mr-1"/> Colaboradores</ToggleGroupItem>
                      <ToggleGroupItem value="especificadores" aria-label="Especificadores"><UserCheck className="h-4 w-4 mr-1"/> Especificadores</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                {renderActiveView()}

                <NovaPessoaDialog open={isDialogOpen} onOpenChange={handleCloseDialog} onSave={handleSave} entityToEdit={editingPessoa} defaultTipo={defaultTipo} />
            </div>
        );
    };

    export default Pessoas;
