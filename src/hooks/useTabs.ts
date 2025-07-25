import { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  href: string;
}

export function useTabs(defaultTab: string, tabs: Tab[]) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const getTabIndex = (tabId: string) => {
    return tabs.findIndex((tab) => tab.id === tabId);
  };

  return {
    activeTab,
    setActiveTab,
    tabs,
    getTabIndex,
  };
}