type TabConfig = {
  id: string;
  label: string;
};

type Props = {
  tabs: TabConfig[];
  activeTab: string;
  onChange: (id: string) => void;
};

export function ClienteTabs({ tabs, activeTab, onChange }: Props) {
  return (
    <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              "px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-all",
              active
                ? "border-amber-500 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
