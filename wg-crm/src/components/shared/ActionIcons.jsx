import React from 'react';
import { Eye, Pencil, Copy, Trash2, FileDown, MessageSquare, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const ActionIcon = ({ label, children, onClick }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent><p>{label}</p></TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


export function ActionIcons({ onView, onEdit, onCopy, onDelete, onPdf, onWhats, onAttach }) {
  return (
    <div className="flex gap-1">
      {onView && <ActionIcon label="Visualizar" onClick={onView}><Eye size={18}/></ActionIcon>}
      {onEdit && <ActionIcon label="Editar" onClick={onEdit}><Pencil size={18}/></ActionIcon>}
      {onCopy && <ActionIcon label="Copiar/Duplicar" onClick={onCopy}><Copy size={18}/></ActionIcon>}
      {onPdf && <ActionIcon label="Baixar PDF" onClick={onPdf}><FileDown size={18}/></ActionIcon>}
      {onWhats && <ActionIcon label="WhatsApp" onClick={onWhats}><MessageSquare size={18} className="text-green-500"/></ActionIcon>}
      {onAttach && <ActionIcon label="Anexar" onClick={onAttach}><Paperclip size={18}/></ActionIcon>}
      {onDelete && <ActionIcon label="Excluir" onClick={onDelete}><Trash2 size={18} className="text-destructive"/></ActionIcon>}
    </div>
  );
}

export default ActionIcons;
