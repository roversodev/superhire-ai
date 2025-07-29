import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createJob = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    description: v.string(),
    skills: v.string(),
    experience: v.string(),
    idealProfile: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      title: args.title,
      company: args.company,
      description: args.description,
      skills: args.skills,
      experience: args.experience,
      idealProfile: args.idealProfile,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    // Agendar a geração de perguntas com IA usando uma action
    await ctx.scheduler.runAfter(0, api.gemini.generateQuestionsWithAI, {
      jobId,
      title: args.title,
      company: args.company,
      description: args.description,
      skills: args.skills,
      experience: args.experience,
      idealProfile: args.idealProfile,
    });

    return jobId;
  },
});

// Nova função para atualizar job
export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.string(),
    company: v.string(),
    description: v.string(),
    skills: v.string(),
    experience: v.string(),
    idealProfile: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.jobId, {
      title: args.title,
      company: args.company,
      description: args.description,
      skills: args.skills,
      experience: args.experience,
      idealProfile: args.idealProfile,
    });
  },
});

export const getJobs = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();
  },
});

export const getJob = query({
  args: { jobId: v.id("jobs"), userId: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    
    // Verificar se o job pertence ao usuário atual
    if (!job || job.createdBy !== args.userId) {
      return null;
    }
    
    return job;
  },
});

// Função para excluir um job e suas perguntas associadas
export const deleteJob = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.createdBy !== args.userId) {
      throw new Error("Job não encontrado ou você não tem permissão para excluí-lo");
    }
    
    // Buscar todas as perguntas associadas ao job
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .collect();
    
    // Excluir todas as perguntas associadas
    for (const question of questions) {
      await ctx.db.delete(question._id);
    }
    
    // Excluir o job
    await ctx.db.delete(args.jobId);
    
    return { success: true };
  },
});

// Adicione esta nova query para verificar o status da geração de perguntas
export const checkQuestionGenerationStatus = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return { status: "error", message: "Job não encontrado" };
    
    // Verificar se já existem perguntas para este job
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .collect();
    
    if (questions.length > 0) {
      return { status: "success", count: questions.length };
    }
    
    // Se não houver perguntas, verificar se há um status de erro armazenado
    if (job.generationError) {
      return { 
        status: "error", 
        message: job.generationError 
      };
    }
    
    // Se não houver perguntas nem erro, ainda está em andamento
    return { status: "pending" };
  },
});

// Adicione esta mutation para registrar erros de geração
export const recordQuestionGenerationError = mutation({
  args: {
    jobId: v.id("jobs"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      generationError: args.errorMessage,
    });
    return { success: true };
  },
});