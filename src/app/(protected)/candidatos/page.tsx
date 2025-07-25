"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


export default function CandidatosPage() {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const {user} = useUser();
  
  const jobs = useQuery(api.jobs.getJobs, user?.id ? { userId: user.id } : "skip");
  const allCandidates = useQuery(api.candidates.getAllCandidates, user?.id ? { userId: user.id } : "skip");
  
  // Filtrar candidatos por vaga selecionada
  const filteredCandidates = selectedJobId
    ? allCandidates?.filter((candidate) => candidate.jobId === selectedJobId)
    : allCandidates;

  // Função para determinar a cor de fundo com base na pontuação
  const getScoreBackgroundColor = (score: number | undefined) => {
    if (!score) return "bg-zinc-700";
    if (score >= 90) return "bg-red-600";
    if (score >= 80) return "bg-red-700";
    if (score >= 70) return "bg-red-800";
    return "bg-red-900";
  };

  // Função para visualizar candidato (redirecionando para página de detalhes)
  const handleViewCandidate = (candidate: any) => {
    router.push(`/candidatos/${candidate._id}`);
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Candidatos</h1>
            
            {/* Seletor de Job */}
            {jobs && jobs.length > 0 && (
              <div className="w-64">
                <Select
                  onValueChange={(value) => setSelectedJobId(value === "todos" ? null : value)}
                  defaultValue="todos"
                >
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione um processo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="todos">Todos os processos</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tabela de Candidatos */}
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">WhatsApp</TableHead>
                  <TableHead className="text-white">Vaga</TableHead>
                  <TableHead className="text-white">Pontuação</TableHead>
                  <TableHead className="text-white">Data</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates?.length ? (
                  filteredCandidates.map((candidate) => {
                    const job = jobs?.find((j) => j._id === candidate.jobId);
                    return (
                      <TableRow key={candidate._id}>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.whatsapp}</TableCell>
                        <TableCell>{job?.title || "Vaga não encontrada"}</TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded text-white text-center ${getScoreBackgroundColor(candidate.score)}`}>
                            {candidate.score}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(candidate.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                            onClick={() => handleViewCandidate(candidate)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-zinc-400">
                      Nenhum candidato encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
