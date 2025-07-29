"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GenericId } from "convex/values";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import * as RechartsPrimitive from "recharts";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useUser();
  const jobs = useQuery(api.jobs.getJobs, user?.id ? { userId: user.id } : "skip");
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  // Estado para armazenar o Job selecionado
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Buscar todos os candidatos
  const allCandidates = useQuery(api.candidates.getAllCandidates, user?.id ? { userId: user.id } : "skip");

  // Organizar candidatos por jobId
  const candidatesByJob = {};
  if (allCandidates) {
    allCandidates.forEach(candidate => {
      const jobId = candidate.jobId;
      if (!(jobId in candidatesByJob)) {
        (candidatesByJob as Record<GenericId<"jobs">, typeof allCandidates>)[jobId] = [];
      }
      (candidatesByJob as Record<GenericId<"jobs">, typeof allCandidates>)[jobId].push(candidate);
    });
  }

  // Preparar dados para o gráfico
  const prepareChartData = () => {
    if (!allCandidates) return [];

    // Filtrar candidatos pelo job selecionado, se houver
    const filteredCandidates = selectedJobId
      ? allCandidates.filter(candidate => candidate.jobId === selectedJobId)
      : allCandidates;

    // Agrupar candidatos por data (dia)
    const candidatesByDate = {};
    filteredCandidates.forEach(candidate => {
      // Converter timestamp para data (apenas o dia)
      const date = new Date(candidate.createdAt);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (!(dateStr in candidatesByDate)) {
        (candidatesByDate as Record<string, number>)[dateStr] = 0;
      }
      (candidatesByDate as Record<string, number>)[dateStr]++;
    });

    // Converter para formato do gráfico
    return Object.entries(candidatesByDate)
      .map(([date, count]) => ({
        name: date,
        value: count,
      }))
      .sort((a, b) => {
        // Ordenar por data (DD/MM)
        const [dayA, monthA] = a.name.split('/');
        const [dayB, monthB] = b.name.split('/');
        const dateA = new Date(2023, parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(2023, parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Preparar dados para a tabela de atividade recente
  const prepareActivityData = () => {
    if (!allCandidates || !jobs) return [];

    // Mapear jobId para título do job
    const jobTitles = {};
    jobs.forEach(job => {
      (jobTitles as Record<GenericId<"jobs">, string>)[job._id] = job.title;
    });

    // Filtrar candidatos pelo job selecionado, se houver
    const filteredCandidates = selectedJobId
      ? allCandidates.filter(candidate => candidate.jobId === selectedJobId)
      : allCandidates;

    // Pegar os candidatos mais recentes
    return filteredCandidates
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(candidate => ({
        name: candidate.name,
        position: (jobTitles as Record<GenericId<"jobs">, string>)[candidate.jobId] || "Cargo não especificado",
        date: new Date(candidate.createdAt).toLocaleString('pt-BR'),
        score: candidate.score,
      }));
  };

  // Preparar dados para o ranking
  const prepareRankingData = () => {
    if (!allCandidates) return [];

    // Filtrar candidatos pelo job selecionado, se houver
    const filteredCandidates = selectedJobId
      ? allCandidates.filter(candidate => candidate.jobId === selectedJobId)
      : allCandidates;

    // Filtrar candidatos com pontuação e ordenar
    return filteredCandidates
      .filter(candidate => candidate.score !== undefined && candidate.score !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 23) // Limitar aos 23 melhores
      .map((candidate, index) => ({
        position: index + 1,
        name: candidate.name,
        score: candidate.score,
      }));
  };

  const chartData = prepareChartData();
  const activityData = prepareActivityData();
  const rankingData = prepareRankingData();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gráfico de Talentos Capturados */}
            <div className="md:col-span-2 bg-zinc-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Talentos Capturados</h2>
              <div className="h-[300px]">
                {chartData.length > 0 ? (
                  <ChartContainer
                    className="h-full aspect-auto" 
                    config={{
                      value: {
                        label: "Candidatos",
                        color: "#ff0000"
                      }
                    }}
                  >
                    <RechartsPrimitive.AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff0000" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <RechartsPrimitive.XAxis dataKey="name" />
                      <RechartsPrimitive.YAxis />
                      <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <RechartsPrimitive.Area
                        type="monotone"
                        dataKey="value"
                        stroke="#ff0000"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </RechartsPrimitive.AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400">
                    Nenhum dado disponível para exibir no gráfico
                  </div>
                )}
              </div>
            </div>

            {/* Ranking */}
            <div className="bg-zinc-900 p-6 rounded-lg overflow-y-auto max-h-[500px]">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Ranking</h2>

                {/* Seletor de Job */}
                {jobs && jobs.length > 0 && (
                  <div className="w-full">
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

                {rankingData.length > 0 ? (
                  <div className="space-y-2">
                    {rankingData.map((item) => (
                      <div key={item.position} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">{item.position}- </span>
                          <span>{item.name}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-white ${(item.score ?? 0) >= 90 ? 'bg-red-600' : (item.score ?? 0) >= 80 ? 'bg-red-700' : (item.score ?? 0) >= 70 ? 'bg-red-800' : 'bg-red-900'}`}>
                          {item.score}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-400 text-center py-4">
                    Nenhum candidato avaliado ainda
                  </div>
                )}
                {rankingData.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="link" className="text-red-500 hover:text-red-400">
                      ver mais
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de Atividade Recente */}
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Atividade Recente</h2>
            {activityData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Nome</TableHead>
                    <TableHead className="text-zinc-400">Cargo Aplicado</TableHead>
                    <TableHead className="text-zinc-400">Data e horário</TableHead>
                    <TableHead className="text-zinc-400">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.map((activity, index) => (
                    <TableRow key={index} className="border-zinc-800">
                      <TableCell>{activity.name}</TableCell>
                      <TableCell>{activity.position}</TableCell>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>
                        <span className={`bg-red-600 text-white px-2 py-1 rounded ${(Number(activity.score) || 0) >= 90 ? 'bg-red-600' : (Number(activity.score) || 0) >= 80 ? 'bg-red-700' : (Number(activity.score) || 0) >= 70 ? 'bg-red-800' : 'bg-red-900'}`}>
                          {activity.score ?? '...'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-zinc-400 text-center py-4">
                Nenhuma atividade recente para exibir
              </div>
            )}
          </div>

          {/* Botão para criar novo processo */}
          {(!jobs || jobs.length === 0) && (
            <Link href="/criar-processo" className="w-full flex items-end justify-end">
              <Button className="w-fit bg-red-600 hover:bg-red-700 text-white">Criar Processo Seletivo</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}