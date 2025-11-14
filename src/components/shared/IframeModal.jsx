
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const IframeModal = ({ open, onOpenChange, src, title }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <div className="flex-grow">
          <iframe
            src={src}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IframeModal;
