import { z } from "zod";

export const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.enum(["full-time", "part-time", "contract", "internship"]),
  remote_policy: z.enum(["onsite", "hybrid", "remote"]),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  salary_currency: z.string(),
  description: z.string().optional(),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  responsibilities: z.string().optional(),
  nice_to_have: z.string().optional(),
  deadline: z.string().optional(),
  auto_score: z.boolean(),
  score_threshold: z.number().min(0).max(100),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
