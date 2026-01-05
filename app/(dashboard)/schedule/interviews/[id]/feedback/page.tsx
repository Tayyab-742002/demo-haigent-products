"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Star,
  User,
  Briefcase,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from "lucide-react";
import type { FeedbackRecommendation } from "@/lib/types";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  recommendation: z.enum(["strong_hire", "hire", "no_hire", "strong_no_hire"]),
  notes: z.string().min(10, "Please provide at least 10 characters of feedback"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface InterviewWithDetails {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string;
  status: string;
  feedback_rating?: number;
  feedback_recommendation?: FeedbackRecommendation;
  feedback_notes?: string;
  feedback_submitted_at?: string;
  candidates: {
    id: string;
    name: string;
    email: string;
    current_title?: string;
    current_company?: string;
    ai_score?: number;
  };
  jobs: {
    id: string;
    title: string;
    department?: string;
  };
  interviewers: {
    id: string;
    name: string;
    email: string;
  };
}

const recommendationOptions: {
  value: FeedbackRecommendation;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    value: "strong_hire",
    label: "Strong Hire",
    description: "Exceptional candidate, highly recommend",
    icon: ThumbsUp,
    color: "text-green-500",
  },
  {
    value: "hire",
    label: "Hire",
    description: "Good fit, recommend proceeding",
    icon: ThumbsUp,
    color: "text-brand-green",
  },
  {
    value: "no_hire",
    label: "No Hire",
    description: "Not a good fit at this time",
    icon: ThumbsDown,
    color: "text-brand-pink",
  },
  {
    value: "strong_no_hire",
    label: "Strong No Hire",
    description: "Significant concerns, do not proceed",
    icon: ThumbsDown,
    color: "text-red-500",
  },
];

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default function InterviewFeedbackPage({ params }: FeedbackPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      recommendation: undefined,
      notes: "",
    },
  });

  const watchedRecommendation = watch("recommendation");

  useEffect(() => {
    async function fetchInterview() {
      try {
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("interviews")
          .select(`
            *,
            candidates (
              id,
              name,
              email,
              current_title,
              current_company,
              ai_score
            ),
            jobs (
              id,
              title,
              department
            ),
            interviewers (
              id,
              name,
              email
            )
          `)
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        setInterview(data as InterviewWithDetails);

        // Pre-fill form if feedback already exists
        if (data.feedback_rating) {
          setSelectedRating(data.feedback_rating);
          setValue("rating", data.feedback_rating);
        }
        if (data.feedback_recommendation) {
          setValue("recommendation", data.feedback_recommendation);
        }
        if (data.feedback_notes) {
          setValue("notes", data.feedback_notes);
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError("Failed to load interview details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInterview();
  }, [id, setValue]);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  const onSubmit = async (data: FeedbackFormData) => {
    // Show confirmation dialog before submitting
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      const formData = watch();

      const { error: updateError } = await supabase
        .from("interviews")
        .update({
          feedback_rating: formData.rating,
          feedback_recommendation: formData.recommendation,
          feedback_notes: formData.notes,
          feedback_submitted_at: new Date().toISOString(),
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Update candidate status to interviewed
      if (interview?.candidates?.id) {
        await supabase
          .from("candidates")
          .update({
            status: "interviewed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", interview.candidates.id);
      }

      router.push("/schedule/interviews");
      router.refresh();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Link href="/schedule/interviews">
          <Button variant="outline">Back to Interviews</Button>
        </Link>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Interview not found</p>
        <Link href="/schedule/interviews">
          <Button variant="outline">Back to Interviews</Button>
        </Link>
      </div>
    );
  }

  const alreadySubmitted = !!interview.feedback_submitted_at;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/schedule/interviews">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">
            Interview Feedback
          </h2>
          <p className="text-muted-foreground">
            {alreadySubmitted ? "View submitted feedback" : "Submit your feedback for this interview"}
          </p>
        </div>
        {alreadySubmitted && (
          <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        )}
      </div>

      {/* Interview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-gold/10">
                <User className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Candidate</p>
                <p className="font-medium">{interview.candidates?.name}</p>
                {interview.candidates?.current_title && (
                  <p className="text-sm text-muted-foreground">
                    {interview.candidates.current_title}
                    {interview.candidates.current_company &&
                      ` at ${interview.candidates.current_company}`}
                  </p>
                )}
              </div>
            </div>

            {/* Position */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-teal/10">
                <Briefcase className="h-5 w-5 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{interview.jobs?.title}</p>
                {interview.jobs?.department && (
                  <p className="text-sm text-muted-foreground">
                    {interview.jobs.department}
                  </p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-pink/10">
                <Calendar className="h-5 w-5 text-brand-pink" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {new Date(interview.scheduled_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(interview.scheduled_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-green/10">
                <Clock className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{interview.duration_minutes} minutes</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {interview.interview_type?.replace("_", " ")} Interview
                </p>
              </div>
            </div>
          </div>

          {/* AI Score Preview */}
          {interview.candidates?.ai_score !== undefined && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">AI Score:</span>
                <Badge
                  variant="outline"
                  className={
                    interview.candidates.ai_score >= 70
                      ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                      : interview.candidates.ai_score >= 50
                      ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                      : "bg-brand-pink/10 text-brand-pink border-brand-pink/20"
                  }
                >
                  {interview.candidates.ai_score}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-brand-gold" />
              Overall Rating
            </CardTitle>
            <CardDescription>
              Rate the candidate&apos;s overall performance (1-5 stars)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={alreadySubmitted}
                  className="p-1 transition-transform hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || selectedRating)
                        ? "fill-brand-gold text-brand-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-4 text-lg font-medium">
                {selectedRating > 0 ? `${selectedRating}/5` : "Not rated"}
              </span>
            </div>
            {errors.rating && (
              <p className="mt-2 text-sm text-destructive">
                Please select a rating
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Recommendation</CardTitle>
            <CardDescription>
              What is your recommendation for this candidate?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendationOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = watchedRecommendation === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("recommendation", option.value)}
                    disabled={alreadySubmitted}
                    className={`p-4 rounded-lg border text-left transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-brand-gold bg-brand-gold/5 ring-2 ring-brand-gold/20"
                        : "border-border hover:border-brand-gold/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${option.color}`} />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.recommendation && (
              <p className="mt-2 text-sm text-destructive">
                Please select a recommendation
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Feedback</CardTitle>
            <CardDescription>
              Provide specific observations, strengths, and areas for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="Share your detailed feedback about the candidate's performance during the interview. Include specific examples, technical competency observations, communication skills, and any other relevant insights..."
              rows={6}
              disabled={alreadySubmitted}
              className="resize-none"
            />
            {errors.notes && (
              <p className="mt-2 text-sm text-destructive">
                {errors.notes.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/schedule/interviews">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>

          {!alreadySubmitted && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to submit your feedback for {interview.candidates?.name}.
              This will mark the interview as completed. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal"
            >
              Submit Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
