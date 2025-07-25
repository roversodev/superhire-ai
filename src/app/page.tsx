"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirecionar para o dashboard se já estiver logado
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-black text-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-3xl text-center">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">SUPER</h1>
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-red-600"></div>
            <h1 className="text-4xl font-bold relative z-10 px-2">HIRE</h1>
          </div>
        </div>
        
        <h2 className="text-2xl font-medium mt-4">Recrutamento Inteligente com IA</h2>
        
        <p className="text-lg mt-2">
          Encontre os melhores talentos para sua equipe através de uma análise cognitiva avançada.
          Nossa IA identifica os candidatos mais adequados para cada função específica.
        </p>
        
        <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md mt-8">
          <h3 className="text-xl font-bold mb-6">Área do Recrutador</h3>
          <p className="mb-8">Faça login ou cadastre-se para criar processos seletivos inteligentes e encontrar os melhores candidatos para sua equipe.</p>
          
          <div className="flex flex-col gap-4">
            <SignInButton mode="modal">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Entrar
              </Button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <Button className="w-full" variant={"outline"}>
                Cadastrar-se
              </Button>
            </SignUpButton>
          </div>
        </div>
        
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Como Funciona</h3>
          <ol className="text-left space-y-4">
            <li className="flex gap-3">
              <span className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
              <p>O recrutador cria um processo seletivo informando o perfil da vaga</p>
            </li>
            <li className="flex gap-3">
              <span className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
              <p>A IA gera perguntas específicas para avaliar as habilidades cognitivas necessárias</p>
            </li>
            <li className="flex gap-3">
              <span className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
              <p>Os candidatos respondem ao formulário de captação</p>
            </li>
            <li className="flex gap-3">
              <span className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</span>
              <p>A IA analisa as respostas e gera um ranking dos melhores candidatos</p>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
