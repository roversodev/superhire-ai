import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
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