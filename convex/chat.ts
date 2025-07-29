import { v } from "convex/values";
import { mutation, query, action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Função para buscar mensagens de chat por jobId e userId
export const getChatMessages = query({
  args: { 
    jobId: v.id("jobs"),
    userId: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_job_and_user", (q) => 
        q.eq("jobId", args.jobId).eq("userId", args.userId)
      )
      .order("asc")
      .collect();
  },
});

// Versão interna da função para buscar mensagens de chat
export const _getChatMessages = internalQuery({
  args: { 
    jobId: v.id("jobs"),
    userId: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_job_and_user", (q) => 
        q.eq("jobId", args.jobId).eq("userId", args.userId)
      )
      .order("asc")
      .collect();
  },
});

// Função para salvar uma mensagem do usuário
export const saveUserMessage = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      jobId: args.jobId,
      userId: args.userId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Versão interna da função para salvar uma mensagem do usuário
export const _saveUserMessage = internalMutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      jobId: args.jobId,
      userId: args.userId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Função para salvar uma resposta da IA
export const saveAssistantMessage = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      jobId: args.jobId,
      userId: args.userId,
      role: "assistant",
      content: args.content,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Versão interna da função para salvar uma resposta da IA
export const _saveAssistantMessage = internalMutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      jobId: args.jobId,
      userId: args.userId,
      role: "assistant",
      content: args.content,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Função para gerar resposta com o Gemini
export const generateChatResponse = action({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConvexError("Gemini API key não encontrada");
    }

    try {
      // Salvar a mensagem do usuário
      await ctx.runMutation(internal.chat._saveUserMessage, {
        jobId: args.jobId,
        userId: args.userId,
        content: args.message,
      });

      // Buscar o job
      const job = await ctx.runQuery(internal.internalFunctions.getJob, {
        jobId: args.jobId,
      });
      if (!job) {
        throw new ConvexError("Vaga não encontrada");
      }

      // Buscar candidatos da vaga
      const candidates = await ctx.runQuery(internal.candidates._getCandidates, {
        jobId: args.jobId,
      });

      // Buscar histórico de mensagens
      const chatHistory = await ctx.runQuery(internal.chat._getChatMessages, {
        jobId: args.jobId,
        userId: args.userId,
      });

      // Inicializar o cliente do Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      // Preparar o contexto para o Gemini
      const jobContext = `
        Título: ${job.title}
        Empresa: ${job.company}
        Descrição: ${job.description}
        Habilidades Técnicas: ${job.skills}
        Experiência: ${job.experience}
        Perfil Ideal: ${job.idealProfile}
      `;

      // Preparar informações sobre candidatos
      const candidatesContext = candidates.length > 0 
        ? `Informações sobre os candidatos para esta vaga:\n${candidates.map(c => {
            return `Nome: ${c.name}\nEmail: ${c.email}\nWhatsApp: ${c.whatsapp}${c.score ? `\nPontuação: ${c.score}/100` : ''}${c.strengths ? `\nPontos fortes: ${c.strengths.join(', ')}` : ''}${c.weaknesses ? `\nPontos fracos: ${c.weaknesses.join(', ')}` : ''}${c.recommendation ? `\nRecomendação: ${c.recommendation}` : ''}\n`;
          }).join('\n')}`
        : "Ainda não há candidatos para esta vaga.";

      // Preparar histórico de chat
      const chatHistoryText = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
      ).join('\n');

      // Preparar o prompt para o Gemini
      const prompt = `
        Você é um assistente de IA especializado em recrutamento e seleção para a SuperHire AI.
        
        CONTEXTO DA VAGA:
        ${jobContext}
        
        CANDIDATOS:
        ${candidatesContext}
        
        HISTÓRICO DE CONVERSA:
        ${chatHistoryText}
        
        INSTRUÇÕES:
        1. Responda à pergunta do usuário com base nas informações da vaga e dos candidatos.
        2. Se o usuário pedir informações que não estão disponíveis, explique educadamente que você não tem essa informação.
        3. Seja profissional, conciso e útil.
        4. Não invente informações que não estão no contexto fornecido.
        5. Se o usuário pedir para comparar candidatos, use os dados de pontuação, pontos fortes e fracos para fazer uma análise justa.
        
        Pergunta do usuário: ${args.message}
      `;

      // Fazer a chamada para a API do Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new ConvexError("Resposta vazia do Gemini");
      }

      // Salvar a resposta da IA
      await ctx.runMutation(internal.chat._saveAssistantMessage, {
        jobId: args.jobId,
        userId: args.userId,
        content: content,
      });

      return { content };
    } catch (error) {
      console.error("Erro ao gerar resposta com IA:", error);
      // Em caso de erro, lançar exceção
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Falha ao gerar resposta com IA. Por favor, tente novamente.");
    }
  },
});