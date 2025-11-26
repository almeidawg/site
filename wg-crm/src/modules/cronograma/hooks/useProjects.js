import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    console.log("Fetching all projects...");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Projects fetched successfully:", data);
      setProjects(data || []);
    } catch(error) {
      console.error('Error fetching projects:', error.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const channel = supabase.channel('projects_realtime_channel_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => { console.log('Change in projects table:', payload); fetchProjects(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_items' }, (payload) => { console.log('Change in project_items table:', payload); fetchProjects(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => { console.log('Change in tasks table:', payload); fetchProjects(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  const addProject = async (projectData) => {
    console.log("Attempting to add project:", projectData);
    if (!projectData.name || !projectData.client_id) {
      const errorMessage = "Validation failed: Name and client_id are required.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          // address column não existe neste schema
          start_date: projectData.start_date || null,
          client_id: projectData.client_id,
          status: 'draft',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log("Project added successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in addProject:", error.message);
      throw error;
    }
  };

  const addProjectItem = async (projectId, itemData) => {
    console.log(`Attempting to add item to project ${projectId}:`, itemData);
    if (!projectId || !itemData.catalog_item_id || !itemData.quantity) {
      const errorMessage = "Validation failed: project_id, catalog_item_id, and quantity are required.";
      console.error(errorMessage);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('project_items')
        .insert({
          project_id: projectId,
          catalog_item_id: itemData.catalog_item_id,
          quantity: itemData.quantity,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Project item added successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in addProjectItem:", error.message);
      return null;
    }
  };

  const getProjectItems = async (projectId) => {
    console.log(`Fetching items for project ID: ${projectId}`);
    try {
      const { data, error } = await supabase
        .from('project_items')
        .select(`*, catalog_item:catalog_items(*)`)
        .eq('project_id', projectId);

      if (error) throw error;

      console.log(`Items for project ${projectId} fetched successfully:`, data);
      return data || [];
    } catch (error) {
      console.error(`Error fetching items for project ${projectId}:`, error.message);
      return [];
    }
  };

  // Keep other functions from previous version
  const deleteProject = async (projectId) => {
    await supabase.from('project_team').delete().eq('project_id', projectId);
    const { data: tasksData } = await supabase.from('tasks').select('id').eq('project_id', projectId);
    if (tasksData && tasksData.length > 0) {
        const taskIds = tasksData.map(t => t.id);
        await supabase.from('task_comments').delete().in('task_id', taskIds);
    }
    await supabase.from('tasks').delete().eq('project_id', projectId);
    await supabase.from('project_items').delete().eq('project_id', projectId);
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    
    if (error) { console.error("Error deleting project:", error); return false; }
    return true;
  };
  
  const addWorkDays = (startDate, days) => {
    let currentDate = new Date(startDate.getTime());
    let daysAdded = 0;
    // Handle start date falling on a weekend
    while ([0, 6].includes(currentDate.getUTCDay())) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    if (days <= 0) return currentDate;

    while (daysAdded < days) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        if (currentDate.getUTCDay() !== 0 && currentDate.getUTCDay() !== 6) {
            daysAdded++;
        }
    }
    return currentDate;
  };


  const generateSchedule = async (projectId) => {
    console.log(`Generating schedule for project ID: ${projectId}`);
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.items || project.items.length === 0) {
        console.error("Schedule generation failed: Project or items not found.");
        return;
    }

    try {
        const newTasks = [];
        let lastEndDate = new Date(project.start_date + 'T00:00:00Z');
        
        // Start date should not be a weekend, adjust if needed
        while ([0, 6].includes(lastEndDate.getUTCDay())) {
            lastEndDate.setUTCDate(lastEndDate.getUTCDate() + 1);
        }
        // Decrement one day to correctly calculate the start of the first task
        lastEndDate.setUTCDate(lastEndDate.getUTCDate() - 1);


        for (const item of project.items) {
          const catalogItem = item.catalog_item;
          if (!catalogItem) {
              console.warn(`Skipping item with id ${item.id} because catalog_item is null.`);
              continue;
          };
          
          const productivity = catalogItem.productivity || 1;
          const setupDays = Math.ceil(catalogItem.setup_days || 0);
          const workDays = Math.ceil((item.quantity || 1) / productivity);
          
          const totalDuration = setupDays + workDays;
          
          const startDate = addWorkDays(lastEndDate, 1);
          // Duration of 1 day means start and end are the same day
          const endDate = addWorkDays(startDate, Math.max(0, totalDuration - 1));

          newTasks.push({
            project_id: projectId,
            project_item_id: item.id, 
            name: catalogItem.name || 'Tarefa sem nome',
            duration: totalDuration, 
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0], 
            is_critical: true, 
            status: 'Pendente'
          });

          lastEndDate = new Date(endDate.getTime());
        }

        console.log("New tasks to be inserted:", newTasks);

        // Batch delete and insert
        await supabase.from('tasks').delete().eq('project_id', projectId);
        const { error: insertError } = await supabase.from('tasks').insert(newTasks);

        if (insertError) throw insertError;

        await supabase.from('projects').update({ status: 'active' }).eq('id', projectId);
        console.log("Schedule generated and project status updated.");
    } catch(error) {
        console.error("Error generating schedule:", error.message);
    }
  };


  return {
    projects,
    loading,
    fetchProjects,
    addProject,
    deleteProject,
    addProjectItem,
    getProjectItems,
    generateSchedule,
  };
};
