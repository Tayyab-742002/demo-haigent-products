// ============================================
// HAIGENT DEMO - TYPE DEFINITIONS
// ============================================

// User & Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  name?: string;
  role: 'admin' | 'member' | 'viewer';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Job Types
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type RemotePolicy = 'onsite' | 'hybrid' | 'remote';

export interface Job {
  id: string;
  organization_id: string;
  created_by: string;
  title: string;
  department?: string;
  location?: string;
  employment_type: EmploymentType;
  remote_policy: RemotePolicy;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  description?: string;
  requirements: string;
  responsibilities?: string;
  nice_to_have?: string;
  status: JobStatus;
  deadline?: string;
  auto_score: boolean;
  score_threshold: number;
  total_candidates: number;
  scored_candidates: number;
  invited_candidates: number;
  scheduled_candidates: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Candidate Types
export type CandidateStatus =
  | 'applied'
  | 'scoring'
  | 'scored'
  | 'invited'
  | 'scheduled'
  | 'interviewed'
  | 'hired'
  | 'rejected';

export type AIRecommendation = 'proceed' | 'maybe' | 'skip';

export interface Candidate {
  id: string;
  job_id: string;
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  resume_text?: string;
  resume_filename?: string;
  current_title?: string;
  current_company?: string;
  experience_years?: number;
  skills: string[];
  ai_score?: number;
  ai_reasoning?: string;
  ai_strengths: string[];
  ai_gaps: string[];
  ai_recommendation?: AIRecommendation;
  scored_at?: string;
  status: CandidateStatus;
  invite_token?: string;
  invited_at?: string;
  invited_by?: string;
  invite_email_sent: boolean;
  invite_email_opened_at?: string;
  invite_link_clicked_at?: string;
  booking_token?: string;
  booked_at?: string;
  source: string;
  referrer?: string;
  created_at: string;
  updated_at: string;
}

// Interviewer Types
export interface Interviewer {
  id: string;
  organization_id: string;
  user_id?: string;
  name: string;
  email: string;
  title?: string;
  department?: string;
  avatar_url?: string;
  // Cal.com Integration Fields (availability managed in Cal.com)
  cal_username?: string;
  cal_api_key?: string;
  cal_event_type_id?: number;
  cal_event_type_slug?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interview Types
export type InterviewStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type InterviewType =
  | 'phone_screen'
  | 'technical'
  | 'behavioral'
  | 'final'
  | 'culture_fit';

export type FeedbackRecommendation =
  | 'strong_hire'
  | 'hire'
  | 'no_hire'
  | 'strong_no_hire';

export interface Interview {
  id: string;
  organization_id: string;
  job_id: string;
  candidate_id: string;
  interviewer_id: string;
  created_by: string;
  scheduled_at: string;
  duration_minutes: number;
  timezone?: string;
  interview_type: InterviewType;
  interview_round: number;
  meeting_provider?: string;
  meeting_link?: string;
  meeting_id?: string;
  cal_booking_uid?: string;
  cal_event_type_id?: number;
  status: InterviewStatus;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  feedback_rating?: number;
  feedback_recommendation?: FeedbackRecommendation;
  feedback_notes?: string;
  feedback_submitted_at?: string;
  feedback_submitted_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  candidate?: Candidate;
  interviewer?: Interviewer;
  job?: Job;
}

// Email Types
export type EmailType =
  | 'invite'
  | 'confirmation'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'feedback_request'
  | 'rejection';

export type EmailStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed';

export interface EmailLog {
  id: string;
  organization_id: string;
  candidate_id: string;
  interview_id?: string;
  email_type: EmailType;
  recipient_email: string;
  subject?: string;
  body?: string;
  status: EmailStatus;
  provider: string;
  provider_id?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  error_message?: string;
  created_at: string;
}

// Activity Log Types
export type ActivityAction =
  | 'job.created'
  | 'job.published'
  | 'job.paused'
  | 'job.closed'
  | 'candidate.applied'
  | 'candidate.scoring'
  | 'candidate.scored'
  | 'candidate.invited'
  | 'candidate.scheduled'
  | 'candidate.interviewed'
  | 'candidate.hired'
  | 'candidate.rejected'
  | 'interview.scheduled'
  | 'interview.confirmed'
  | 'interview.completed'
  | 'interview.cancelled';

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: ActivityAction;
  entity_type: 'job' | 'candidate' | 'interview';
  entity_id: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// AI Scoring Types
export interface AIScoreResult {
  score: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  recommendation: AIRecommendation;
}

// Agent Types (for unified platform)
export type AgentType =
  | 'schedule'
  | 'sourcing'
  | 'reference'
  | 'onboarding'
  | 'benefits'
  | 'payroll'
  | 'engee';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

// Dashboard Stats Types
export interface ScheduleDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  pendingScoring: number;
  scheduledInterviews: number;
  completedInterviews: number;
  avgScore: number;
  conversionRate: number;
}
