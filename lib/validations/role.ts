import { z } from "zod";

export const roleFormSchema = z.object({
  title: z.string().min(1, "Role title is required"),
  department: z.string().optional(),
  location: z.string().optional(),
  experience_required: z.string().optional(),
  skills: z.string().min(1, "At least one skill is required"),
  description: z.string().min(1, "Job description is required"),
  salary_range: z.string().optional(),
  company_name: z.string().min(1, "Company name is required"), // Changed from optional to required
});

export type RoleFormData = z.infer<typeof roleFormSchema>;
