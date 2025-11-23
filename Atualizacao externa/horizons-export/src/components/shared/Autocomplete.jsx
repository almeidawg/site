import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/SupabaseAuthContext';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Autocomplete = ({ table, displayColumn, value, onChange, placeholder, filterColumn, filterValue }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { orgId } = useAuth();

  const selectedItem = useMemo(() => {
    if (!value) return null;
    
    const selectedId = typeof value === 'object' ? value.id : value;
    const foundItem = items.find(item => item.id === selectedId);
    if (foundItem) return foundItem;

    if (typeof value === 'object' && value !== null && value.id) {
      return { id: value.id, nome: value[displayColumn] || value.nome || placeholder };
    }
    
    return null;
  }, [items, value, displayColumn, placeholder]);
  
  const fetchItems = useCallback(async (term) => {
    if (!open || !orgId) return;
    setLoading(true);
    
    let query = supabase.from(table).select(`id, ${displayColumn}`);
    
    const tablesWithOrgId = ['fin_accounts', 'fin_categories', 'parties', 'comercial_setores', 'comercial_categorias', 'comercial_procedencias', 'empresas', 'produtos_servicos'];
    if (tablesWithOrgId.includes(table)) {
        query = query.eq('org_id', orgId);
    }
    
    if (term) {
      query = query.ilike(displayColumn, `%${term}%`);
    }
    if (filterColumn && filterValue) {
      query = query.eq(filterColumn, filterValue);
    }
    
    const { data, error } = await query.limit(30);

    if (!error) {
      const formattedData = data.map(item => ({ id: item.id, nome: item[displayColumn] }));
      setItems(formattedData || []);
    } else {
        console.error(`Autocomplete error on table ${table}:`, error);
        setItems([]);
    }
    setLoading(false);
  }, [table, displayColumn, filterColumn, filterValue, open, orgId]);

  useEffect(() => {
    if (open) {
      fetchItems(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, open, fetchItems]);

  const handleSelect = (item) => {
    onChange(item);
    setSearchTerm("");
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) setSearchTerm("");
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left"
        >
          <span className="truncate">{selectedItem ? selectedItem.nome : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={`Buscar...`}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>{loading ? 'Carregando...' : 'Nenhum resultado.'}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.nome}
                  onSelect={() => handleSelect(item)}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedItem?.id === item.id ? "opacity-100" : "opacity-0")} />
                  {item.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Autocomplete;