import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useTeams = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      // Algumas bases não possuem created_at; ordenamos por id para evitar erro de coluna inexistente
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      setMembers([]);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();

    const channel = supabase.channel('team_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchMembers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMembers]);

  const addMember = async (memberData) => {
    const { error } = await supabase.from('team_members').insert([memberData]);
    if (error) {
      console.error('Error adding team member:', error);
      return false;
    }
    return true;
  };

  const updateMember = async (memberId, memberData) => {
    const { error } = await supabase
      .from('team_members')
      .update({ ...memberData, updated_at: new Date().toISOString() })
      .eq('id', memberId);
    if (error) {
      console.error('Error updating team member:', error);
      return false;
    }
    return true;
  };

  const deleteMember = async (memberId) => {
    await supabase.from('project_team').delete().eq('member_id', memberId);
    
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
    return true;
  };

  const uploadProfilePicture = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return { 
    members, 
    teamMembers: members, 
    loading, 
    addMember, 
    updateMember, 
    deleteMember, 
    uploadProfilePicture,
    // Keep legacy names for compatibility if components use them
    addTeamMember: addMember, 
    updateTeamMember: updateMember, 
    deleteTeamMember: deleteMember 
  };
};
