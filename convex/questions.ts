import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getQuestionsByJobId = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .collect();
  },
});

export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.questionId, {
      question: args.question,
    });
  },
});

// Nova mutation para remover uma pergunta
export const deleteQuestion = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.questionId);
  },
});

// Versão pública da mutation para criar perguntas
export const _createQuestion = mutation({
  args: {
    jobId: v.id("jobs"),
    question: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      jobId: args.jobId,
      question: args.question,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});

// Versão interna da mutation (renomeada para evitar conflito de nomes)
export const createQuestion = internalMutation({
  args: {
    jobId: v.id("jobs"),
    question: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      jobId: args.jobId,
      question: args.question,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});