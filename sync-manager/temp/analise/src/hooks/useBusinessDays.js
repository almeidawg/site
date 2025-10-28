import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useBusinessDays = (uf = '', municipio = '') => {
  const [holidays, setHolidays] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchHolidays = useCallback(async (year) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-feriados', {
        body: { ano: year, uf, municipio },
      });
      if (error) throw error;
      if (data.ok) {
        return data.feriados.map(f => f.data);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      return [];
    }
  }, [uf, municipio]);

  useEffect(() => {
    const loadHolidays = async () => {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const [holidaysCurrent, holidaysNext] = await Promise.all([
        fetchHolidays(currentYear),
        fetchHolidays(currentYear + 1),
      ]);
      setHolidays(new Set([...holidaysCurrent, ...holidaysNext]));
      setLoading(false);
    };
    loadHolidays();
  }, [fetchHolidays]);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=Sunday, 6=Saturday
  };

  const formatDate = (date) => date.toISOString().slice(0, 10);

  const isHoliday = useCallback((date) => {
    return holidays.has(formatDate(date));
  }, [holidays]);

  const addBusinessDays = useCallback((startDate, days) => {
    if (loading) return null;
    const d = new Date(startDate.getTime());
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (!isWeekend(d) && !isHoliday(d)) {
        added++;
      }
    }
    return d;
  }, [isHoliday, loading]);

  const getBusinessDaysDiff = useCallback((startDate, endDate) => {
    if (loading || !startDate || !endDate || endDate < startDate) return 0;
    const d = new Date(startDate.getTime());
    let total = 0;
    while (d <= endDate) {
      if (!isWeekend(d) && !isHoliday(d)) {
        total++;
      }
      d.setDate(d.getDate() + 1);
    }
    return total;
  }, [isHoliday, loading]);
  
  const getNextBusinessDay = useCallback((date) => {
    if (loading) return null;
    const d = new Date(date.getTime());
    while (isWeekend(d) || isHoliday(d)) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }, [isHoliday, loading]);

  return {
    loading,
    holidays,
    addBusinessDays,
    getBusinessDaysDiff,
    getNextBusinessDay,
    formatDate,
  };
};