
import React from 'react';
import { useTabs } from '@/contexts/TabContext';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const TabManager = () => {
  const { tabs, activeTab, setActiveTab, closeTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    <div className="bg-muted/50 border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center h-10 px-4 py-2 text-sm font-medium cursor-pointer border-r relative group',
                activeTab?.path === tab.path
                  ? 'bg-background text-primary border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <span className="mr-2">{tab.label}</span>
              {tab.path !== '/dashboard' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-2 rounded-full hover:bg-destructive/20 hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default TabManager;
