import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Video,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Globe,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { getAgent } from "@/lib/constants/agents";
import type { InterviewStatus, FeedbackRecommendation } from "@/lib/types";

export const dynamic = "force-dynamic";

interface InterviewDetailPageProps {
  params: Promise<{ id: string }>;
}

function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const variants: Record<string, { label: string; className: string }> = {
    scheduled: {
      label: "Scheduled",
      className: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-brand-green/10 text-brand-green border-brand-green/20",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
    },
    completed: {
      label: "Completed",
      className: "bg-brand-green/10 text-brand-green border-brand-green/20",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-muted text-muted-foreground border-muted",
    },
    no_show: {
      label: "No Show",
      className: "bg-brand-pink/10 text-brand-pink border-brand-pink/20",
    },
    rescheduled: {
      label: "Rescheduled",
      className: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
    },
  };

  const variant = variants[status] || variants.scheduled;

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: FeedbackRecommendation }) {
  const variants: Record<FeedbackRecommendation, { label: string; className: string; icon: React.ElementType }> = {
    strong_hire: {
      label: "Strong Hire",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: CheckCircle,
    },
    hire: {
      label: "Hire",
      className: "bg-brand-green/10 text-brand-green border-brand-green/20",
      icon: CheckCircle,
    },
    no_hire: {
      label: "No Hire",
      className: "bg-brand-pink/10 text-brand-pink border-brand-pink/20",
      icon: XCircle,
    },
    strong_no_hire: {
      label: "Strong No Hire",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: XCircle,
    },
  };

  const variant = variants[recommendation];
  const Icon = variant.icon;

  return (
    <Badge variant="outline" className={variant.className}>
      <Icon className="h-3 w-3 mr-1" />
      {variant.label}
    </Badge>
  );
}

export default async function InterviewDetailPage({ params }: InterviewDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  const { data: interview, error } = await supabase
    .from("schedule_interviews")
    .select(`
      *,
      schedule_candidates!inner (
        id,
        name,
        email,
        phone,
        timezone,
        current_title,
        current_company,
        linkedin_url,
        portfolio_url,
        ai_score,
        ai_recommendation,
        status
      ),
      schedule_jobs!inner (
        id,
        title,
        department,
        location
      ),
      schedule_interviewers!inner (
        id,
        name,
        email,
        title,
        department
      )
    `)
    .eq("id", id)
    .single();

  if (error || !interview) {
    notFound();
  }

  const candidate = interview.candidates;
  const job = interview.jobs;
  const interviewer = interview.interviewers;

  const scheduledDate = new Date(interview.scheduled_at);
  const isPast = scheduledDate < new Date();
  const hasFeedback = !!interview.feedback_submitted_at;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`bg-${primaryColor} rounded-xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <Link href="/schedule/interviews">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {interview.meeting_link && (
              <a
                href={interview.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              </a>
            )}
            <Link href={`/schedule/interviews/${id}/feedback`}>
              <Button
                className={
                  hasFeedback
                    ? "bg-brand-green hover:bg-brand-green/90 text-white"
                    : "bg-white text-brand-charcoal hover:bg-white/90"
                }
              >
                {hasFeedback ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Feedback
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isPast ? "Submit Feedback" : "Prepare Feedback"}
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Icon name="calendar" size={48} className="text-white" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Interview Details
              </h1>
              <InterviewStatusBadge status={interview.status} />
            </div>
            <p className="text-white/80 text-lg">
              {job?.title} - {candidate?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Details */}
          <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="calendar" size={20} className="text-brand-gold" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {scheduledDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {scheduledDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{interview.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{interview.timezone || "Not specified"}</p>
                </div>
              </div>

              {interview.meeting_link && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Meeting Link</p>
                  <a
                    href={interview.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-teal hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    {interview.meeting_link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {interview.cal_booking_uid && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Cal.com Booking ID: <span className="font-mono text-xs">{interview.cal_booking_uid}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidate Information */}
          <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="user" size={20} className="text-brand-teal" />
                Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{candidate?.name}</h3>
                  {candidate?.current_title && (
                    <p className="text-muted-foreground">
                      {candidate.current_title}
                      {candidate.current_company && ` at ${candidate.current_company}`}
                    </p>
                  )}
                </div>
                {candidate?.ai_score !== undefined && candidate?.ai_score !== null && (
                  <Badge
                    variant="outline"
                    className={
                      candidate.ai_score >= 70
                        ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                        : candidate.ai_score >= 50
                        ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                        : "bg-brand-pink/10 text-brand-pink border-brand-pink/20"
                    }
                  >
                    AI Score: {candidate.ai_score}%
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${candidate?.email}`} className="hover:underline">
                    {candidate?.email}
                  </a>
                </div>
                {candidate?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${candidate.phone}`} className="hover:underline">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate?.timezone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.timezone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {candidate?.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                )}
                {candidate?.portfolio_url && (
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Portfolio
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                )}
                <Link href={`/schedule/candidates/${candidate?.id}`}>
                  <Button variant="outline" size="sm">
                    View Full Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Summary (if submitted) */}
          {hasFeedback && (
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="communication" size={20} className="text-brand-green" />
                  Interview Feedback
                </CardTitle>
                <CardDescription>
                  Submitted on {new Date(interview.feedback_submitted_at!).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= (interview.feedback_rating || 0)
                              ? "fill-brand-gold text-brand-gold"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{interview.feedback_rating}/5</span>
                  </div>

                  {interview.feedback_recommendation && (
                    <RecommendationBadge recommendation={interview.feedback_recommendation} />
                  )}
                </div>

                {interview.feedback_notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{interview.feedback_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Position Card */}
          <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="briefcase" size={16} className="text-brand-gold" />
                Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold">{job?.title}</h4>
              {job?.department && (
                <p className="text-sm text-muted-foreground">{job.department}</p>
              )}
              {job?.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </div>
              )}
              <Link href={`/schedule/jobs/${job?.id}`} className="block mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  View Job
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Interviewer Card */}
          <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="user" size={16} className="text-brand-teal" />
                Interviewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interviewer ? (
                <>
                  <h4 className="font-semibold">{interviewer.name}</h4>
                  {interviewer.title && (
                    <p className="text-sm text-muted-foreground">{interviewer.title}</p>
                  )}
                  {interviewer.department && (
                    <p className="text-sm text-muted-foreground">{interviewer.department}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <Mail className="h-3 w-3" />
                    {interviewer.email}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Interview Type */}
          <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="checklist" size={16} className="text-brand-pink" />
                Interview Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">
                  {interview.interview_type?.replace("_", " ") || "General"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Round</p>
                <p className="font-medium">Round {interview.interview_round || 1}</p>
              </div>
              {interview.meeting_provider && (
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium capitalize">{interview.meeting_provider}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reminders Status */}
          <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="analytics" size={16} className="text-brand-gold" />
                Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>24h Reminder</span>
                {interview.reminder_24h_sent ? (
                  <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                    Sent
                  </Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>1h Reminder</span>
                {interview.reminder_1h_sent ? (
                  <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                    Sent
                  </Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
