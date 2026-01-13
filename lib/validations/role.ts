import { z } from "zod";

export const roleFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department: z.string().optional(),
  location: z.string().optional(),
  experience_required: z.string().optional(),
  skills: z.string().min(1, "At least one skill is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  salary_range: z.string().optional(),
  company_name: z.string().default("Haigent"),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;
