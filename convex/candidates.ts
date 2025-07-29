import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const createCandidate = mutation({
  args: {
    name: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("candidates", {
      name: args.name,
      whatsapp: args.whatsapp,
      email: args.email,
      jobId: args.jobId,
      createdAt: Date.now(),
    });
  },
});

export const getAllCandidates = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userJobs = await ctx.db
      .query("jobs")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .collect();

    if (userJobs.length === 0) {
      return [];
    }

    const candidates = await ctx.db
      .query("candidates")
      .withIndex("by_job_id", (q) =>
        q.eq("jobId", userJobs[0]._id)
      )
      .collect();

    if (userJobs.length > 1) {
      const otherCandidates = await Promise.all(
        userJobs.slice(1).map((job) =>
          ctx.db
            .query("candidates")
            .withIndex("by_job_id", (q) => q.eq("jobId", job._id))
            .collect()
        )
      );
      
      return [...candidates, ...otherCandidates.flat()];
    }

    return candidates;
  },
});


export const getCandidates = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("candidates")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .order("desc")
      .collect();
  },
});

export const _getCandidates = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("candidates")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .order("desc")
      .collect();
  },
});

export const submitAnswer = mutation({
  args: {
    candidateId: v.id("candidates"),
    questionId: v.id("questions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("answers", {
      candidateId: args.candidateId,
      questionId: args.questionId,
      answer: args.answer,
    });
  },
});

export const analyzeCandidate = mutation({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, api.gemini.analyzeWithAI, {
      candidateId: args.candidateId,
    });
    
    return 0;
  },
});


export const getCandidate = query({
  args: { id: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.id);
    return candidate;
  },
});