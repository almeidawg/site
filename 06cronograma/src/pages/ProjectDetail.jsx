import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useProjects } from '@/hooks/useProjects';
import { Loader2, ArrowLeft, Play, GanttChart, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProjectItems from '@/components/ProjectItems';
import ScheduleView from '@/components/ScheduleView';
import ProjectTeam from '@/components/ProjectTeam';
import PdfExport from '@/components/PdfExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ProjectDetail = () => {
    const { id } = useParams();
    const { projects, loading, generateSchedule } = useProjects();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const project = projects.find(p => p.id === id);

    const handleGenerateSchedule = async () => {
        setIsGenerating(true);
        toast({ title: "Gerando cronograma...", description: "Isso pode levar alguns instantes." });
        try {
            await generateSchedule(id);
            toast({ title: "Cronograma gerado com sucesso!", description: "A página será atualizada com as novas tarefas." });
        } catch (error) {
            console.error("Error during schedule generation:", error);
            toast({ variant: 'destructive', title: "Erro ao gerar cronograma", description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading && !project) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    }

    if (!project) {
        return <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
            <p className="text-slate-600 mb-6">O projeto que você está procurando não existe ou foi movido.</p>
            <Button asChild><Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" />Voltar aos projetos</Link></Button>
        </div>;
    }

    const hasTasks = project.tasks && project.tasks.length > 0;

    return (
        <>
            <Helmet>
                <title>{project.name} - WGEasy Cronograma</title>
                <meta name="description" content={`Detalhes e cronograma do projeto ${project.name}`} />
            </Helmet>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Button variant="ghost" asChild className="mb-2 -ml-4">
                            <Link to="/projects"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link>
                        </Button>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{project.name}</h1>
                        <p className="text-slate-600 mt-1">{project.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasTasks && <PdfExport project={project} scheduleSelector="#schedule-print-area" />}
                        <Button onClick={handleGenerateSchedule} disabled={isGenerating || !project.items || project.items.length === 0}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            {hasTasks ? 'Recalcular Cronograma' : 'Gerar Cronograma'}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="schedule" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg">
                        <TabsTrigger value="schedule"><GanttChart className="h-4 w-4 mr-2"/>Cronograma</TabsTrigger>
                        <TabsTrigger value="items"><List className="h-4 w-4 mr-2"/>Itens</TabsTrigger>
                        <TabsTrigger value="team"><Users className="h-4 w-4 mr-2"/>Equipe</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedule" className="mt-4">
                        <ScheduleView project={project} />
                    </TabsContent>
                    <TabsContent value="items" className="mt-4">
                         <ProjectItems project={project} />
                    </TabsContent>
                    <TabsContent value="team" className="mt-4">
                        <ProjectTeam project={project} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
};

export default ProjectDetail;