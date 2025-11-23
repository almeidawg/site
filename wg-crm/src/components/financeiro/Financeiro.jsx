
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Financeiro = () => {
    const [lancamentos, setLancamentos] = useLocalStorage('crm_lancamentos', []);
    const { toast } = useToast();

    const handleNotImplemented = (feature) => {
        toast({
            title: `🚧 ${feature} em Breve!`,
            description: "Esta funcionalidade será implementada em breve.",
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((acc, l) => acc + l.valor, 0);
    const totalDespesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((acc, l) => acc + l.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    const lucratividade = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1>Módulo Financeiro</h1>
                    <p className="text-muted-foreground mt-1">
                        Controle total sobre as finanças dos seus projetos e da empresa.
                    </p>
                </div>
                <Button
                    onClick={() => handleNotImplemented('Novo Lançamento')}
                >
                    <Plus size={20} className="mr-2" />
                    Novo Lançamento
                </Button>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReceitas)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalDespesas)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <DollarSign className={`h-4 w-4 ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(saldo)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucratividade</CardTitle>
                        <TrendingUp className="h-4 w-4 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${lucratividade >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{lucratividade.toFixed(1)}%</div>
                         <p className="text-xs text-muted-foreground">Sobre o faturamento</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="lancamentos">
                <TabsList>
                    <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
                    <TabsTrigger value="centros_custo" onClick={() => handleNotImplemented('Centros de Custo')}>Centros de Custo</TabsTrigger>
                    <TabsTrigger value="fluxo_caixa" onClick={() => handleNotImplemented('Fluxo de Caixa')}>Fluxo de Caixa</TabsTrigger>
                    <TabsTrigger value="relatorios" onClick={() => handleNotImplemented('Relatórios')}>Relatórios</TabsTrigger>
                </TabsList>
                <TabsContent value="lancamentos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Lançamentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {lancamentos.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Nenhum lançamento registrado ainda. Clique em "Novo Lançamento" para começar.
                                </p>
                             ) : (
                                <div>A tabela de lançamentos será implementada aqui.</div>
                             )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Financeiro;
