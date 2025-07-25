"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CandidatoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const candidateId = params.id as string;
  
  const candidate = useQuery(api.candidates.getCandidate, { id: candidateId as any });
  const jobs = useQuery(api.jobs.getJobs, user?.id ? { userId: user.id } : "skip");
  
  // Função para determinar a cor do badge com base na pontuação
  const getScoreBadgeVariant = (score: number | undefined) => {
    if (!score) return "secondary";
    if (score >= 90) return "default";
    if (score >= 80) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  // Função para obter as iniciais do nome para o avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (!candidate) {
    return (
      <div className="container max-w-5xl py-10 px-4 mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
          >
            Voltar
          </Button>
          <div className="h-6 w-40 bg-zinc-800 animate-pulse rounded"></div>
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-zinc-800 animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-zinc-800 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-zinc-800 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const jobTitle = jobs?.find((j) => j._id === candidate.jobId)?.title || "Vaga não encontrada";

  return (
    <div className="container max-w-5xl py-10 px-4 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {candidate.name}
              <Badge variant={getScoreBadgeVariant(candidate.score)} className="text-sm">
                {candidate.score}
              </Badge>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">{jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
            onClick={() => window.location.href = `mailto:${candidate.email}`}
          >
            Contatar
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.location.href = `https://wa.me/${candidate.whatsapp.replace(/\D/g, '')}`}
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Perfil do Candidato */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8 p-0">
        <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="size-20 bg-zinc-800 border border-zinc-700">
            <AvatarFallback className="text-lg">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Email</p>
                <p className="font-medium truncate">{candidate.email}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-1">WhatsApp</p>
                <p className="font-medium">{candidate.whatsapp}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-1">Data da Candidatura</p>
                <p className="font-medium">{new Date(candidate.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs para Análise */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-800 mb-6 w-full justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-700 cursor-pointer">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="strengths" className="data-[state=active]:bg-zinc-700 cursor-pointer">
            Pontos Fortes
          </TabsTrigger>
          <TabsTrigger value="weaknesses" className="data-[state=active]:bg-zinc-700 cursor-pointer">
            Pontos Fracos
          </TabsTrigger>
        </TabsList>
        
        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 p-0">
            <CardHeader className="p-6">
              <CardTitle>Recomendação</CardTitle>
              <CardDescription>Análise geral do perfil do candidato</CardDescription>
            </CardHeader>
            <Separator className="bg-zinc-800" />
            <div className="p-6">
              <ScrollArea className="h-[200px] rounded-md">
                {candidate.recommendation ? (
                  <p className="text-zinc-200 leading-relaxed">{candidate.recommendation}</p>
                ) : (
                  <p className="text-zinc-400">Nenhuma recomendação disponível</p>
                )}
              </ScrollArea>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 p-0">
              <CardHeader className="p-6">
                <CardTitle className="text-green-500">Principais Pontos Fortes</CardTitle>
              </CardHeader>
              <Separator className="bg-zinc-800" />
              <div className="p-6">
                {candidate.strengths && candidate.strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {candidate.strengths.slice(0, 3).map((strength: string, index: number) => (
                      <li key={index} className="bg-zinc-800 p-3 rounded-md">
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400">Nenhum ponto forte registrado</p>
                )}
              </div>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800 p-0">
              <CardHeader className="p-6">
                <CardTitle className="text-red-500">Principais Pontos Fracos</CardTitle>
              </CardHeader>
              <Separator className="bg-zinc-800" />
              <div className="p-6">
                {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
                  <ul className="space-y-3">
                    {candidate.weaknesses.slice(0, 3).map((weakness: string, index: number) => (
                      <li key={index} className="bg-zinc-800 p-3 rounded-md">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400">Nenhum ponto fraco registrado</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab: Pontos Fortes */}
        <TabsContent value="strengths">
          <Card className="bg-zinc-900 border-zinc-800 p-0">
            <CardHeader className="p-6">
              <CardTitle className="text-green-500">Pontos Fortes</CardTitle>
              <CardDescription>Lista completa de pontos fortes identificados</CardDescription>
            </CardHeader>
            <Separator className="bg-zinc-800" />
            <div className="p-6">
              {candidate.strengths && candidate.strengths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.strengths.map((strength: string, index: number) => (
                    <div key={index} className="bg-zinc-800 p-4 rounded-md">
                      <p>{strength}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">Nenhum ponto forte registrado</p>
              )}
            </div>
          </Card>
        </TabsContent>
        
        {/* Tab: Pontos Fracos */}
        <TabsContent value="weaknesses">
          <Card className="bg-zinc-900 border-zinc-800 p-0">
            <CardHeader className="p-6">
              <CardTitle className="text-red-500">Pontos Fracos</CardTitle>
              <CardDescription>Lista completa de pontos fracos identificados</CardDescription>
            </CardHeader>
            <Separator className="bg-zinc-800" />
            <div className="p-6">
              {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.weaknesses.map((weakness: string, index: number) => (
                    <div key={index} className="bg-zinc-800 p-4 rounded-md">
                      <p>{weakness}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">Nenhum ponto fraco registrado</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}