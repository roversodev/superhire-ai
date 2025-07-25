"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Id } from "@/../convex/_generated/dataModel";

export default function PerguntasPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PerguntasContent />
    </Suspense>
  );
}

function PerguntasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const candidateId = searchParams.get("candidateId");
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const submitAnswer = useMutation(api.candidates.submitAnswer);
  const analyzeCandidate = useMutation(api.candidates.analyzeCandidate);
  
  const questions = useQuery(api.questions.getQuestionsByJobId, 
    jobId ? { jobId: jobId as Id<"jobs"> } : "skip"
  );

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: e.target.value
    }));
  };

  const handleNext = async () => {
    if (!jobId || !candidateId || !questions) return;
    
    setLoading(true);
    
    try {
      // Salvar a resposta atual
      if (answers[currentQuestion]) {
        await submitAnswer({
          candidateId: candidateId as Id<"candidates">,
          questionId: questions[currentQuestion]._id,
          answer: answers[currentQuestion]
        });
      }
      
      if (currentQuestion < questions.length - 1) {
        // Avançar para a próxima pergunta
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Finalizar o questionário
        await analyzeCandidate({ candidateId: candidateId as Id<"candidates"> });
        setCompleted(true);
      }
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!jobId || !candidateId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h2 className="text-xl mb-4">Link inválido</h2>
          <p className="text-zinc-400 mb-6">Este link não contém as informações necessárias.</p>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h2 className="text-xl mb-4">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (completed) {
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

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 text-center">
              <div className="bg-green-600/20 text-green-400 p-3 rounded-lg mb-6">
                <h2 className="text-xl font-bold">Respostas enviadas com sucesso!</h2>
                <p>Obrigado por participar do processo seletivo</p>
              </div>
              
              <p className="text-zinc-400 mb-6">
                Suas respostas foram analisadas pela nossa IA. O recrutador entrará em contato em breve.
              </p>
              
              <Button 
                onClick={() => router.push("/")} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Voltar para o Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex justify-between mb-6">
              <span className="text-sm text-zinc-400">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-zinc-400">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            
            <div className="w-full bg-zinc-800 h-2 rounded-full mb-6">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">{questions[currentQuestion].question}</h3>
                <Textarea
                  value={answers[currentQuestion] || ""}
                  onChange={handleAnswerChange}
                  placeholder="Digite sua resposta aqui..."
                  className="bg-zinc-800 border-zinc-700 min-h-[150px]"
                />
              </div>
              
              <Button 
                onClick={handleNext} 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading || !answers[currentQuestion]}
              >
                {loading ? "Salvando..." : currentQuestion < questions.length - 1 ? "Próxima Pergunta" : "Finalizar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}