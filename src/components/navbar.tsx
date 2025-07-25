"use client";

import Link from "next/link";
import { UserButton } from "@/components/auth/user-button";
import { SignedIn } from "@clerk/clerk-react";
import { AnimatedTabs } from "./animated-tabs";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: `/dashboard`,
    },
    {
      id: "criar-processo",
      label: "Criar Processos",
      href: `/criar-processo`,
    },
    {
      id: "gerenciar-processos",
      label: "Gerenciar Processos",
      href: `/gerenciar-processos`,
    },
    {
      id: "candidatos",
      label: "Candidatos",
      href: `/candidatos`,
    },
    {
      id: "/banco-dados",
      label: "Banco de Dados AI",
      href: `/banco-dados`,
    },
  ];

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold">SUPER</span>
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-red-600"></div>
                <span className="text-xl font-bold relative z-10 px-1">HIRE</span>
              </div>
            </div>
          </Link>
        </div>

        <SignedIn>
          {/* Menu para desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <AnimatedTabs tabs={tabs} />
          </nav>

          {/* Menu para mobile */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-zinc-900 border-zinc-800 p-0 w-[80%] sm:w-[350px]">
                <SheetHeader className="p-4 border-b border-zinc-800">
                  <SheetTitle className="text-white flex items-center gap-1">
                    <span className="text-xl font-bold">SUPER</span>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full border-2 border-red-600"></div>
                      <span className="text-xl font-bold relative z-10 px-1">HIRE</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <nav className="flex flex-col space-y-1">
                    {tabs.map((tab) => (
                      <SheetClose asChild key={tab.id}>
                        <Link 
                          href={tab.href}
                          className="px-4 py-3 hover:bg-zinc-800 transition-colors text-white font-medium"
                        >
                          {tab.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  
                  {/* UserButton dentro do menu mobile */}
                  <div className="mt-4 px-4 pt-4 border-t border-zinc-800">
                    <UserButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* UserButton para desktop */}
          <div className="hidden md:flex items-center gap-4">
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}