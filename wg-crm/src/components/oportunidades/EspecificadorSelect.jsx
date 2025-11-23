import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useEspecificadores } from '@/hooks/useEspecificadores';
import { Loader2 } from 'lucide-react';

const EspecificadorSelect = ({ value, onChange, label = "Especificador" }) => {
    const { data: especificadores, isLoading } = useEspecificadores();

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Carregando especificadores...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value || ""} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um especificador" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {especificadores?.map(espec => (
                        <SelectItem key={espec.id} value={espec.id}>
                            {espec.nome}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {value && especificadores && (
                <p className="text-xs text-gray-600">
                    {especificadores.find(e => e.id === value)?.email || ''}
                </p>
            )}
        </div>
    );
};

export default EspecificadorSelect;
