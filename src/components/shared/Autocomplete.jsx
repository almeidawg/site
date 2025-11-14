
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Autocomplete = ({
  table,
  displayColumn,
  value,
  onChange,
  placeholder,
  filterColumn,
  filterValue,
}) => {
  const { orgId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDisplay, setSelectedDisplay] = useState('');
  const wrapperRef = useRef(null);

  const fetchInitialDisplay = useCallback(async () => {
    if (value && !selectedDisplay) {
        const { data, error } = await supabase
            .from(table)
            .select(displayColumn)
            .eq('id', value)
            .single();
        if (data) {
            setSelectedDisplay(data[displayColumn]);
        }
    } else if (!value) {
        setSelectedDisplay('');
    }
  }, [value, table, displayColumn, selectedDisplay]);

  useEffect(() => {
    fetchInitialDisplay();
  }, [value, fetchInitialDisplay]);

  const fetchOptions = useCallback(async (term) => {
    if (term.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    
    let query = supabase.from(table).select(`id, ${displayColumn}`);
    
    // Org-specific tables
    const orgTables = ['fin_accounts', 'fin_categories', 'parties', 'comercial_setores', 'comercial_categorias', 'comercial_procedencias'];
    if (orgTables.includes(table) && orgId) {
        query = query.eq('org_id', orgId);
    }
    
    if (filterColumn && filterValue) {
      query = query.eq(filterColumn, filterValue);
    }
    
    query = query.ilike(displayColumn, `%${term}%`).limit(10);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching autocomplete options:', error);
      setOptions([]);
    } else {
      setOptions(data);
    }
    setLoading(false);
  }, [table, displayColumn, filterColumn, filterValue, orgId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        fetchOptions(searchTerm);
      } else {
        setOptions([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSelectedDisplay(option[displayColumn]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSelectedDisplay('');
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={selectedDisplay || searchTerm}
          onChange={(e) => {
            if (selectedDisplay) {
                handleClear(e);
            }
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pr-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
        {!loading && selectedDisplay && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {options.map((option) => (
              <li
                key={option.id}
                className="px-3 py-2 cursor-pointer hover:bg-accent"
                onMouseDown={() => handleSelect(option)}
              >
                {option[displayColumn]}
              </li>
))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
