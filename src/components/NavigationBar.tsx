import React from 'react';
import { Calculator, BarChart3, Settings2, Sparkles } from 'lucide-react';
import { ScreenTab } from '../types';

interface NavigationBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  isCalculated: boolean;
  isEligible: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentTab,
  onSelectTab,
  isCalculated,
  isEligible,
}) => {
  const tabs: Array<{
    id: ScreenTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'input',
      label: 'Input',
      icon: <Calculator className="h-5 w-5" />,
    },
    {
      id: 'result',
      label: 'Result',
      icon: <BarChart3 className="h-5 w-5" />,
      badge: isCalculated ? (isEligible ? 'Due' : 'Info') : undefined,
      badgeColor: isEligible ? 'bg-emerald-600' : 'bg-amber-600',
    },
    {
      id: 'chat',
      label: 'AI Guide',
      icon: <Sparkles className="h-5 w-5" />,
      badge: 'AI',
      badgeColor: 'bg-[#E5C158] text-slate-900',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings2 className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className="group flex flex-1 flex-col items-center py-1 transition-all"
            >
              {/* Material 3 Active Pill Container */}
              <div
                className={`relative flex h-8 w-16 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0F4C3A] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold shadow ${
                      tab.badgeColor ? tab.badgeColor : isEligible ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1 text-[11px] tracking-normal ${
                  isActive
                    ? 'font-semibold text-[#0F4C3A] dark:text-emerald-400'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
