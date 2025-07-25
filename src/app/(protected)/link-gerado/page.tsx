"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

export default function LinkGeradoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LinkGeradoContent />
    </Suspense>
  );
}

function LinkGeradoContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const router = useRouter();
  
  const [copied, setCopied] = useState(false);
  const linkCaptacao = jobId 
    ? `${window.location.origin}/candidatar/${jobId}` 
    : "Link não disponível";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkCaptacao);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Redirecionar se não tiver jobId
  useEffect(() => {
    if (!jobId) {
      router.push("/dashboard");
    }
  }, [jobId, router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">SUPER</h1>
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-4 border-red-600"></div>
              <h1 className="text-3xl font-bold relative z-10 px-2">HIRE</h1>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 text-center">
          <div className="bg-green-600/20 text-green-400 p-3 rounded-lg mb-6">
            <h2 className="text-xl font-bold">Processo criado com sucesso!</h2>
            <p>A IA gerou as perguntas ideais para sua vaga</p>
          </div>

          <h3 className="text-lg font-medium mb-4">Link de captação:</h3>
          
          <div className="flex mb-6">
            <Input 
              value={linkCaptacao} 
              readOnly 
              className="bg-zinc-800 border-zinc-700 rounded-r-none" 
            />
            <Button 
              onClick={copyToClipboard} 
              className={`rounded-l-none ${copied ? 'bg-green-600' : 'bg-red-600'} hover:bg-red-700 text-white`}
            >
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          
          <p className="text-zinc-400 mb-6">
            Compartilhe este link com os candidatos. Eles responderão às perguntas geradas pela IA
            e você receberá uma análise completa de cada um.  
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => router.push("/dashboard")} 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Ver Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push("/")} 
              className="w-full"
            >
              Voltar para o Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}