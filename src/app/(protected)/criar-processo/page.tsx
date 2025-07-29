"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Id } from "@/../convex/_generated/dataModel";
import Lottie from "lottie-react";
import loadingAnimation from "@/lib/loading.json";

export default function CriarProcessoPage() {
  const router = useRouter();
  const { user } = useUser();
  const createJob = useMutation(api.jobs.createJob);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const createQuestion = useMutation(api.questions._createQuestion);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [jobId, setJobId] = useState<Id<"jobs"> | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    skills: "",
    experience: "",
    idealProfile: "",
  });

  const getQuestions = useQuery(
    api.questions.getQuestionsByJobId,
    jobId ? { jobId } : "skip"
  );


  useEffect(() => {
    if (getQuestions && jobId) {
      if (getQuestions.length > 0) {
        setQuestions(getQuestions);
        setGeneratingQuestions(false);
      }
    }
  }, [getQuestions, jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], question: value };
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() && jobId) {
      createQuestion({
        jobId,
        question: newQuestion,
        type: "text",
      }).then((newQuestionId) => {
        setQuestions([...questions, {
          _id: newQuestionId,
          jobId,
          question: newQuestion,
          type: "text",
          createdAt: Date.now(),
        }]);
        setNewQuestion("");
      });
    }
  };

  const saveQuestions = async () => {
    setLoading(true);
    try {
      for (const q of questions) {
        await updateQuestion({
          questionId: q._id,
          question: q.question,
        });
      }
      
      router.push(`/link-gerado?jobId=${jobId}`);
    } catch (error) {
      console.error("Erro ao salvar perguntas:", error);
      setLoading(false);
    }
  };

  const [formErrors, setFormErrors] = useState({
    step1: false,
    step2: false,
    step3: false
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
        setFormErrors(prev => ({ ...prev, step1: true }));
        return;
      }
    } else if (step === 2) {
      if (!formData.skills.trim() || !formData.experience.trim()) {
        setFormErrors(prev => ({ ...prev, step2: true }));
        return;
      }
    }
    
    setFormErrors(prev => ({ ...prev, [`step${step}`]: false }));
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idealProfile.trim()) {
      setFormErrors(prev => ({ ...prev, step3: true }));
      return;
    }
    
    setLoading(true);
    
    try {
      const newJobId = await createJob({
        ...formData,
        createdBy: user?.id || "",
      });
      
      setJobId(newJobId);
      setGeneratingQuestions(true);
      nextStep();
    } catch (error) {
      console.error("Erro ao criar processo:", error);
      setGeneratingQuestions(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Loader */}
      {generatingQuestions && (
        <div className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl">
          <div className="h-96 w-96 relative">
            <Lottie 
              animationData={loadingAnimation} 
              loop={true} 
              autoplay={true} 
            />
          </div>
          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Criar Processo Seletivo</h1>
            <p className="text-zinc-400">Preencha as informações abaixo para criar um novo processo seletivo</p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex justify-between mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${step === i ? 'bg-red-600' : step > i ? 'bg-green-600' : 'bg-zinc-700'}`}
                    >
                      {step > i ? '✓' : i}
                    </div>
                    <span className="text-xs mt-1 text-zinc-400">
                      {i === 1 ? 'Básico' : i === 2 ? 'Requisitos' : i === 3 ? 'Perfil' : 'Perguntas'}
                    </span>
                  </div>
                ))}
              </div>

              {step < 4 ? (
                <form onSubmit={handleSubmit}>

                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">Título da Vaga</label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Ex: Desenvolvedor Full Stack"
                          className="bg-zinc-800 border-zinc-700"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium mb-1">Empresa</label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Ex: SuperHire Tech"
                          className="bg-zinc-800 border-zinc-700"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição da Vaga</label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Descreva as responsabilidades e o dia a dia do profissional..."
                          className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="skills" className="block text-sm font-medium mb-1">Habilidades Técnicas</label>
                        <Textarea
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="Ex: React, Node.js, TypeScript, SQL..."
                          className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium mb-1">Experiência Necessária</label>
                        <Textarea
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          placeholder="Ex: 3+ anos de experiência com desenvolvimento web..."
                          className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="idealProfile" className="block text-sm font-medium mb-1">Perfil Ideal do Candidato</label>
                        <Textarea
                          id="idealProfile"
                          name="idealProfile"
                          value={formData.idealProfile}
                          onChange={handleChange}
                          placeholder="Descreva as características comportamentais e soft skills desejadas..."
                          className="bg-zinc-800 border-zinc-700 min-h-[150px]"
                          required
                        />
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 mt-6">
                        <h3 className="text-sm font-medium mb-2">Como funciona?</h3>
                        <p className="text-xs text-zinc-400">
                          Após criar o processo, nossa IA irá gerar perguntas específicas para avaliar os candidatos com base nas informações fornecidas. 
                          Você poderá revisar e personalizar essas perguntas antes de compartilhar o link com os candidatos.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    {step > 1 ? (
                      <Button 
                        type="button" 
                        onClick={prevStep}
                        variant="outline" 
                        className="border-zinc-700 hover:bg-zinc-800"
                      >
                        Voltar
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    
                    {step < 3 ? (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Próximo
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={loading}
                      >
                        {loading ? "Criando..." : "Criar Processo"}
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-2">Perguntas Geradas pela IA</h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Revise as perguntas geradas pela IA e faça as modificações necessárias. Você também pode adicionar novas perguntas personalizadas.
                  </p>
                  
                  {/* Mostrar mensagem de carregamento enquanto as perguntas estão sendo geradas */}
                  {generatingQuestions || questions.length === 0 ? (
                    <div className="bg-zinc-800 p-4 rounded-lg text-center py-8">
                      <p>Gerando perguntas personalizadas para esta vaga...</p>
                      <p className="text-xs text-zinc-500 mt-2">Isso pode levar alguns instantes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <div key={q._id} className="bg-zinc-800 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-zinc-400">Pergunta {index + 1}</span>
                          </div>
                          <Textarea
                            value={q.question}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            className="bg-zinc-700 border-zinc-600 min-h-[100px]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Só mostrar o formulário de adição de perguntas e botões quando as perguntas já foram carregadas */}
                  {!generatingQuestions && questions.length > 0 && (
                    <>
                      <div className="bg-zinc-800 p-4 rounded-lg mt-6">
                        <h3 className="text-sm font-medium mb-2">Adicionar Nova Pergunta</h3>
                        <Textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Digite uma nova pergunta personalizada..."
                          className="bg-zinc-700 border-zinc-600 min-h-[100px] mb-3"
                        />
                        <Button 
                          onClick={handleAddQuestion}
                          className="w-full bg-zinc-700 hover:bg-zinc-600"
                          disabled={!newQuestion.trim()}
                        >
                          Adicionar Pergunta
                        </Button>
                      </div>

                      <div className="flex justify-between mt-8">
                        <Button 
                          onClick={prevStep}
                          variant="outline" 
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          Voltar
                        </Button>
                        
                        <Button 
                          onClick={saveQuestions}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={loading || questions.length === 0}
                        >
                          {loading ? "Salvando..." : "Finalizar Processo"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}