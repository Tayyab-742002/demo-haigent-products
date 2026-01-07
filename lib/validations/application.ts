import { z } from "zod";

export const applicationFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  timezone: z.string(),
  linkedin_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  current_title: z.string().optional(),
  current_company: z.string().optional(),
  experience_years: z.number().min(0).max(50).optional().nullable(),
  cover_letter: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
