"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  ChartBarIcon,
  CircleQuestionMark,
  FileTextIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function BancoDadosPage() {
  const { user } = useUser();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstPromptSent, setIsFirstPromptSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Referência para o container de mensagens
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Buscar jobs do usuário
  const jobs = useQuery(api.jobs.getJobs, user?.id ? { userId: user.id } : "skip");
  const selectedJob = useQuery(
    api.jobs.getJob,
    selectedJobId && user?.id ? { jobId: selectedJobId as any, userId: user.id } : "skip"
  );

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const jobMenuRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const getChatMessages = useQuery(
    api.chat.getChatMessages,
    selectedJobId && user?.id ? { jobId: selectedJobId as any, userId: user.id } : "skip"
  );
  const generateChatResponse = useAction(api.chat.generateChatResponse);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `60px`;
        return;
      }

      textarea.style.height = `60px`;
      const newHeight = Math.max(
        60,
        Math.min(textarea.scrollHeight, 200)
      );

      textarea.style.height = `${newHeight}px`;
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Seleção de job via botão de projeto
  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsJobMenuOpen(false);
  };

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobMenuRef.current && !jobMenuRef.current.contains(event.target as Node)) {
        setIsJobMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Rolar para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Alternar o menu de jobs
  const toggleJobMenu = () => {
    setIsJobMenuOpen(!isJobMenuOpen);
  };

  // Função para enviar mensagem com validação
  const handleSendMessage = async () => {
    if (!selectedJobId) {
      // Ativar efeito de shake se não tiver job selecionado
      setShakeInput(true);
      toast.error("Selecione uma vaga para continuar");
      setTimeout(() => setShakeInput(false), 500);
      return;
    }

    if (value.trim()) {
      // Marcar que o primeiro prompt foi enviado
      if (!isFirstPromptSent) {
        setIsFirstPromptSent(true);
      }

      // Adicionar mensagem do usuário
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: value.trim()
      };

      setMessages(prev => [...prev, userMessage]);
      setValue("");
      adjustHeight(true);
      setIsLoading(true);

      try {
        // Chamar a API para gerar resposta
        const response = await generateChatResponse({
          jobId: selectedJobId as any,
          userId: user?.id || "anonymous",
          message: userMessage.content
        });

        // Adicionar resposta da IA
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: response.content
        };

        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error("Erro ao gerar resposta:", error);
        toast.error("Erro ao gerar resposta. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Adicionar função para carregar mensagens anteriores
  const loadChatMessages = useCallback(async () => {
    if (!selectedJobId || !user?.id) return;

    try {
      const chatMessages = await getChatMessages

      if (chatMessages && chatMessages.length > 0) {
        // Converter mensagens do formato do banco para o formato da UI
        const formattedMessages = chatMessages.map(msg => ({
          id: msg._id,
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));

        setMessages(formattedMessages);
        setIsFirstPromptSent(true);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  }, [selectedJobId, user?.id]);

  // Adicionar useEffect para carregar mensagens quando o job é selecionado
  useEffect(() => {
    loadChatMessages();
  }, [loadChatMessages]);

  return (
    <div className="h-[calc(100vh-61px)] bg-black text-white flex items-center justify-center">
      {!isFirstPromptSent ? (
        <div className="container mx-auto">
          <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            {/* SVG no centro antes do título */}
            <div className="jsx-842594706 mb-4 w-20 h-20 relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 200 200" width="100%" height="100%" className="jsx-842594706 w-full h-full">
                <g clipPath="url(#cs_clip_1_ellipse-12)" className="jsx-842594706">
                  <mask id="cs_mask_1_ellipse-12" width="200" height="200" x="0" y="0" maskUnits="userSpaceOnUse" className="jsx-842594706" style={{ maskType: "alpha" }}>
                    <path fill="#fff" fillRule="evenodd" d="M100 150c27.614 0 50-22.386 50-50s-22.386-50-50-50-50 22.386-50 50 22.386 50 50 50zm0 50c55.228 0 100-44.772 100-100S155.228 0 100 0 0 44.772 0 100s44.772 100 100 100z" clipRule="evenodd" className="jsx-842594706"></path>
                  </mask>
                  <g mask="url(#cs_mask_1_ellipse-12)" className="jsx-842594706">
                    <path fill="#fff" d="M200 0H0v200h200V0z" className="jsx-842594706"></path>
                    <path fill="#0066FF" fillOpacity="0.33" d="M200 0H0v200h200V0z" className="jsx-842594706"></path>
                    <g filter="url(#filter0_f_844_2811)" className="jsx-842594706 animate-gradient">
                      <path fill="#FF0000" d="M110 32H18v68h92V32z" className="jsx-842594706"></path>
                      <path fill="#CC0000" d="M188-24H15v98h173v-98z" className="jsx-842594706"></path>
                      <path fill="#FF3333" d="M175 70H5v156h170V70z" className="jsx-842594706"></path>
                      <path fill="#FF6666" d="M230 51H100v103h130V51z" className="jsx-842594706"></path>
                    </g>
                  </g>
                </g>
                <defs className="jsx-842594706">
                  <filter id="filter0_f_844_2811" width="385" height="410" x="-75" y="-104" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" className="jsx-842594706">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" className="jsx-842594706"></feFlood>
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" className="jsx-842594706"></feBlend>
                    <feGaussianBlur result="effect1_foregroundBlur_844_2811" stdDeviation="40" className="jsx-842594706"></feGaussianBlur>
                  </filter>
                  <clipPath id="cs_clip_1_ellipse-12" className="jsx-842594706">
                    <path fill="#fff" d="M0 0H200V200H0z" className="jsx-842594706"></path>
                  </clipPath>
                </defs>
                <g mask="url(#cs_mask_1_ellipse-12)" className="jsx-842594706" style={{ mixBlendMode: "overlay" }}>
                  <path fill="gray" stroke="transparent" d="M200 0H0v200h200V0z" filter="url(#cs_noise_1_ellipse-12)" className="jsx-842594706"></path>
                </g>
                <defs className="jsx-842594706">
                  <filter id="cs_noise_1_ellipse-12" width="100%" height="100%" x="0%" y="0%" filterUnits="objectBoundingBox" className="jsx-842594706">
                    <feTurbulence baseFrequency="0.6" numOctaves="5" result="out1" seed="4" className="jsx-842594706"></feTurbulence>
                    <feComposite in="out1" in2="SourceGraphic" operator="in" result="out2" className="jsx-842594706"></feComposite>
                    <feBlend in="SourceGraphic" in2="out2" mode="overlay" result="out3" className="jsx-842594706"></feBlend>
                  </filter>
                </defs>
              </svg>
            </div>

            <h1 className="lg:text-4xl text-2xl font-bold text-center text-white">
              Pergunte para a SuperHire AI
            </h1>

            <div className="w-full">
              <div
                ref={inputContainerRef}
                className={cn(
                  "relative bg-neutral-900 rounded-xl border",
                  shakeInput ? "animate-shake border-red-500" : "border-neutral-800"
                )}
              >
                <div className="overflow-y-auto">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte sobre seus candidatos e processos seletivos..."
                    className={cn(
                      "w-full px-4 py-3",
                      "resize-none",
                      "bg-transparent",
                      "border-none",
                      "text-white text-sm",
                      "focus:outline-none",
                      "focus-visible:ring-0 focus-visible:ring-offset-0",
                      "placeholder:text-neutral-500 placeholder:text-sm",
                      "min-h-[60px]"
                    )}
                    style={{
                      overflow: "hidden",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botão de seleção de projeto (job) - Versão minimalista */}
                    <div className="relative" ref={jobMenuRef}>
                      <button
                        type="button"
                        onClick={toggleJobMenu}
                        className={cn(
                          "cursor-pointer px-2 py-1 rounded-lg text-sm transition-colors flex items-center gap-1",
                          selectedJobId
                            ? "text-white bg-zinc-800 hover:bg-zinc-700"
                            : "text-zinc-400 border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                        )}
                      >
                        {selectedJobId ? null : <PlusIcon className="w-3 h-3" />}
                        <span className="truncate max-w-[120px]">
                          {selectedJob ? selectedJob.title : "Selecionar Vaga"}
                        </span>
                      </button>
                      {isJobMenuOpen && jobs && jobs.length > 0 && (
                        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#171717] border border-[#454545] ring-opacity-5 z-10 px-2">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {jobs.map((job) => (
                              <button
                                key={job._id}
                                className="block w-full text-left px-3 cursor-pointer py-2 text-sm rounded-lg text-white hover:bg-zinc-700"
                                onClick={() => handleSelectJob(job._id)}
                              >
                                {job.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                       {isJobMenuOpen && jobs && jobs.length === 0 && (
                        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#171717] border border-[#454545] ring-opacity-5 z-10 px-2">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                className="block w-full text-left px-3 cursor-pointer py-2 text-sm rounded-lg text-white hover:bg-zinc-700"
                              >
                                Nenhum processo.
                              </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className={cn(
                        "cursor-pointer px-1.5 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-1",
                        value.trim()
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-400"
                      )}
                    >
                      <ArrowUpIcon
                        className={cn(
                          "w-4 h-4",
                          value.trim()
                            ? "text-white"
                            : "text-zinc-400"
                        )}
                      />
                      <span className="sr-only">Enviar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center gap-3 mt-4">
                <p className="text-sm text-neutral-400">O que você pode fazer com a SuperHire</p>
              </div>
              <div className="hidden lg:flex items-center justify-center gap-3 mt-4">
                <ActionButton
                  icon={<ChartBarIcon className="w-4 h-4" />}
                  label="Análise de Candidatos"
                />
                <ActionButton
                  icon={<UsersIcon className="w-4 h-4" />}
                  label="Comparar Perfis"
                />
                <ActionButton
                  icon={<CircleQuestionMark className="w-4 h-4" />}
                  label="Gerar Perguntas"
                />
                <ActionButton
                  icon={<FileTextIcon className="w-4 h-4" />}
                  label="Resumo do Processo"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 h-full flex flex-col">
          <div className="flex flex-col h-full">
            {/* Área de mensagens */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto py-4 space-y-6"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "px-4 py-2 max-w-3xl mx-auto",
                    message.role === "user" ? "bg-neutral-800 rounded-lg w-fit" : ""
                  )}
                >
                  <div className="flex items-start gap-3">
                    {message.role === "assistant" && (
                      <div className="w-6 h-6 mt-1 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                        SH
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content.split('**').map((part, index) => (
                          index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="px-4 py-2 max-w-3xl mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-1 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                      SH
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Área de input fixa na parte inferior */}
            <div className="py-4 px-20 mx-20">
              <div
                ref={inputContainerRef}
                className={cn(
                  "relative bg-neutral-900 rounded-xl border",
                  shakeInput ? "animate-shake border-red-500" : "border-neutral-800"
                )}
              >
                <div className="overflow-y-auto">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Envie uma mensagem..."
                    className={cn(
                      "w-full px-4 py-3",
                      "resize-none",
                      "bg-transparent",
                      "border-none",
                      "text-white text-sm",
                      "focus:outline-none",
                      "focus-visible:ring-0 focus-visible:ring-offset-0",
                      "placeholder:text-neutral-500 placeholder:text-sm",
                      "min-h-[60px]"
                    )}
                    style={{
                      overflow: "hidden",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={jobMenuRef}>
                      <button
                        type="button"
                        onClick={toggleJobMenu}
                        className={cn(
                          "cursor-pointer px-2 py-1 rounded-lg text-sm transition-colors flex items-center gap-1",
                          selectedJobId
                            ? "text-white bg-zinc-800 hover:bg-zinc-700"
                            : "text-zinc-400 border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                        )}
                      >
                        {selectedJobId ? null : <PlusIcon className="w-3 h-3" />}
                        <span className="truncate max-w-[120px]">
                          {selectedJob ? selectedJob.title : "Selecionar Vaga"}
                        </span>
                      </button>
                      {isJobMenuOpen && jobs && jobs.length > 0 && (
                        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#171717] border border-[#454545] ring-opacity-5 z-10 px-2">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {jobs.map((job) => (
                              <button
                                key={job._id}
                                className="block w-full text-left px-3 cursor-pointer py-2 text-sm rounded-lg text-white hover:bg-zinc-700"
                                onClick={() => handleSelectJob(job._id)}
                              >
                                {job.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className={cn(
                        "cursor-pointer px-1.5 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-1",
                        value.trim()
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-400"
                      )}
                    >
                      <ArrowUpIcon
                        className={cn(
                          "w-4 h-4",
                          value.trim()
                            ? "text-white"
                            : "text-zinc-400"
                        )}
                      />
                      <span className="sr-only">Enviar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
