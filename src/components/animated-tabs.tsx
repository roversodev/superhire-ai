"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Tab } from "@/hooks/useTabs";

interface AnimatedTabsProps {
  tabs: Tab[];
  eventName?: string;
  showContainer?: boolean;
}

export function AnimatedTabs({ tabs, eventName, showContainer = true }: AnimatedTabsProps) {
  const pathname = usePathname();
  
  // Determina qual aba está ativa com base no pathname atual
  const activeTab = tabs.find((tab) => pathname.includes(tab.href)) || tabs[0];
  tabs.findIndex((tab) => tab.id === activeTab.id);

  const tabsContent = (
    <>
      {eventName && showContainer && (
        <h1 className="text-xl font-bold mb-2 truncate">{eventName}</h1>
      )}
      
      <div className="relative flex space-x-1 overflow-x-auto pb-1 touch-pan-x scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 whitespace-nowrap",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#232323] rounded-md"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );

  if (!showContainer) {
    return tabsContent;
  }

  return (
    <div className="w-full sticky top-0 z-10">
        {tabsContent}
    </div>
  );
}