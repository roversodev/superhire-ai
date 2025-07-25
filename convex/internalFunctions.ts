import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

// Função para obter um candidato por ID
export const getCandidate = internalQuery({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.candidateId);
  },
});

// Função para obter um job por ID
export const getJob = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Função para obter perguntas por jobId
export const getQuestionsByJobId = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .collect();
  },
});

// Função para obter respostas por candidateId
export const getAnswersByCandidateId = internalQuery({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("answers")
      .withIndex("by_candidate_id", (q) => q.eq("candidateId", args.candidateId))
      .collect();
  },
});

// Função para atualizar um candidato com os resultados da análise
export const updateCandidateAnalysis = internalMutation({
  args: {
    candidateId: v.id("candidates"),
    score: v.number(),
    strengths: v.array(v.string()),
    weaknesses: v.array(v.string()),
    recommendation: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.candidateId, {
      score: args.score,
      strengths: args.strengths,
      weaknesses: args.weaknesses,
      recommendation: args.recommendation,
    });
  },
});