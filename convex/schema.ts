import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),
  
  jobs: defineTable({
    title: v.string(),
    company: v.string(),
    description: v.string(),
    skills: v.string(),
    experience: v.string(),
    idealProfile: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_created_by", ["createdBy"]),
  
  candidates: defineTable({
    name: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    jobId: v.id("jobs"),
    score: v.optional(v.number()),
    strengths: v.optional(v.array(v.string())),
    weaknesses: v.optional(v.array(v.string())),
    recommendation: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_job_id", ["jobId"]),
  
  answers: defineTable({
    candidateId: v.id("candidates"),
    questionId: v.id("questions"),
    answer: v.string(),
    score: v.optional(v.number()),
  }).index("by_candidate_id", ["candidateId"]),
  
  questions: defineTable({
    jobId: v.id("jobs"),
    question: v.string(),
    type: v.string(),
    options: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_job_id", ["jobId"]),
  
  // Nova tabela para mensagens de chat
  chatMessages: defineTable({
    jobId: v.id("jobs"),
    userId: v.string(),
    role: v.string(), // "user" ou "assistant"
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_job_id", ["jobId"])
    .index("by_job_and_user", ["jobId", "userId"]),
});