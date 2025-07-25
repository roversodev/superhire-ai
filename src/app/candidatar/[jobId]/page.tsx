"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function CandidatarPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    email: "",
  });

  const createCandidate = useMutation(api.candidates.createCandidate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const candidateId = await createCandidate({
        name: formData.nome,
        whatsapp: formData.whatsapp,
        email: formData.email,
        jobId: jobId as Id<"jobs">,
      });
      
      router.push(`/perguntas?jobId=${jobId}&candidateId=${candidateId}`);
    } catch (error) {
      console.error("Erro ao criar candidato:", error);
      setLoading(false);
    }
  };

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

        <h2 className="text-xl text-center mb-8">Preencha seus dados!</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nome" className="block">Nome</label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Matheus Rocha"
              value={formData.nome}
              onChange={handleChange}
              required
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="block">Número do Whatsapp</label>
            <Input
              id="whatsapp"
              name="whatsapp"
              placeholder="Ex: (11) 93742-4197"
              value={formData.whatsapp}
              onChange={handleChange}
              required
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block">Melhor E-mail</label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ex: matheus@wtsoftware.com.br"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 mt-6"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Começar!"}
          </Button>
        </form>
      </div>
    </div>
  );
}