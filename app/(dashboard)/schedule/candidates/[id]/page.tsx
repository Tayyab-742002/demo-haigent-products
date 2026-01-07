import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateStatusBadge } from "@/components/schedule/candidates/CandidateStatusBadge";
import { ScoreBadge } from "@/components/schedule/candidates/ScoreBadge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Briefcase,
  Building2,
  Clock,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  MapPin,
  User,
  Video,
  ExternalLink,
} from "lucide-react";
import { CandidateStatusUpdate } from "@/components/schedule/candidates/CandidateStatusUpdate";
import { Icon } from "@/components/ui/icon";
import { getAgent } from "@/lib/constants/agents";

export const dynamic = "force-dynamic";

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  // Fetch candidate with job info
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select(`
      *,
      jobs (
        id,
        title,
        department,
        location,
        score_threshold
      )
    `)
    .eq("id", id)
    .single();

  if (error || !candidate) {
    notFound();
  }

  // Fetch interviews for this candidate
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("candidate_id", id)
    .order("scheduled_at", { ascending: false });

  const interviewsList = interviews || [];

  // Get recommendation config
  const getRecommendationConfig = (recommendation: string | null) => {
    switch (recommendation) {
      case "shortlisted":
      case "proceed":
        return { label: "Proceed", color: "bg-brand-green/10 text-brand-green border-brand-green/20", icon: CheckCircle };
      case "maybe":
        return { label: "Maybe", color: "bg-brand-gold/10 text-brand-gold border-brand-gold/20", icon: AlertCircle };
      case "rejected":
      case "skip":
        return { label: "Skip", color: "bg-brand-pink/10 text-brand-pink border-brand-pink/20", icon: XCircle };
      default:
        return { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock };
    }
  };

  const recommendationConfig = getRecommendationConfig(candidate.ai_recommendation);
  const RecommendationIcon = recommendationConfig.icon;

  const meetsThreshold = candidate.ai_score && candidate.jobs?.score_threshold
    ? candidate.ai_score >= candidate.jobs.score_threshold
    : false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row bg-${primaryColor} rounded-xl p-6 sm:items-center sm:justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <Link href={`/schedule/jobs/${candidate.job_id}`}>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all rounded-lg h-10 w-10 p-0 flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <ScoreBadge score={candidate.ai_score} size="lg" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Icon name="user" size={32} className="text-white" />
                {candidate.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <CandidateStatusBadge status={candidate.status} />
                {candidate.jobs && (
                  <Link
                    href={`/schedule/jobs/${candidate.job_id}`}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {candidate.jobs.title}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <CandidateStatusUpdate candidateId={candidate.id} currentStatus={candidate.status} />
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="analytics" size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">AI Score</p>
                <p className="text-2xl font-bold text-brand-charcoal">{candidate.ai_score ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${meetsThreshold ? "bg-brand-green" : "bg-brand-pink"} shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name={meetsThreshold ? "approval" : "cancel"} size={20} className={meetsThreshold ? "text-brand-green" : "text-brand-pink"} />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">
                  {meetsThreshold ? "Above Threshold" : "Below Threshold"}
                </p>
                <p className="text-2xl font-bold text-brand-charcoal">{candidate.jobs?.score_threshold ?? 70}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="calendar" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Interviews</p>
                <p className="text-2xl font-bold text-brand-charcoal">{interviewsList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${
          recommendationConfig.label === "Proceed" ? "bg-brand-green" :
          recommendationConfig.label === "Maybe" ? "bg-brand-gold" :
          recommendationConfig.label === "Skip" ? "bg-brand-pink" : "bg-muted"
        } shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <RecommendationIcon className={`h-5 w-5 ${
                  recommendationConfig.label === "Proceed" ? "text-brand-green" :
                  recommendationConfig.label === "Maybe" ? "text-brand-gold" :
                  recommendationConfig.label === "Skip" ? "text-brand-pink" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">AI Recommendation</p>
                <p className="text-2xl font-bold text-brand-charcoal">{recommendationConfig.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1.5 h-auto rounded-xl">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-brand-teal data-[state=active]:text-white rounded-lg px-6 py-2.5 font-medium transition-all"
          >
            <Icon name="user" size={16} className="mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="ai-analysis"
            className="data-[state=active]:bg-brand-gold data-[state=active]:text-brand-charcoal rounded-lg px-6 py-2.5 font-medium transition-all"
          >
            <Icon name="analytics" size={16} className="mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger
            value="resume"
            className="data-[state=active]:bg-brand-pink data-[state=active]:text-white rounded-lg px-6 py-2.5 font-medium transition-all"
          >
            <Icon name="document" size={16} className="mr-2" />
            Resume & Cover Letter
          </TabsTrigger>
          <TabsTrigger
            value="interviews"
            className="data-[state=active]:bg-brand-green data-[state=active]:text-white rounded-lg px-6 py-2.5 font-medium transition-all"
          >
            <Icon name="calendar" size={16} className="mr-2" />
            Interviews ({interviewsList.length})
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="communication" size={20} className="text-brand-teal" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${candidate.email}`} className="text-brand-teal hover:underline">
                    {candidate.email}
                  </a>
                </div>

                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-brand-teal">
                      {candidate.phone}
                    </a>
                  </div>
                )}

                {candidate.timezone && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.timezone}</span>
                  </div>
                )}

                {candidate.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-teal hover:underline flex items-center gap-1"
                    >
                      LinkedIn Profile
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {candidate.portfolio_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={candidate.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-teal hover:underline flex items-center gap-1"
                    >
                      Portfolio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="briefcase" size={20} className="text-brand-gold" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.current_title && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{candidate.current_title}</span>
                  </div>
                )}

                {candidate.current_company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.current_company}</span>
                  </div>
                )}

                {candidate.experience_years && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.experience_years} years of experience</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Applied {new Date(candidate.created_at).toLocaleDateString()}
                  </span>
                </div>

                {candidate.source && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground capitalize">Source: {candidate.source}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applied Position */}
          {candidate.jobs && (
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="target" size={20} className="text-brand-pink" />
                  Applied Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{candidate.jobs.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {candidate.jobs.department && <span>{candidate.jobs.department}</span>}
                      {candidate.jobs.location && (
                        <>
                          <span>•</span>
                          <span>{candidate.jobs.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link href={`/schedule/jobs/${candidate.job_id}`}>
                    <Button variant="outline" size="sm">
                      View Job
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-6">
          {candidate.ai_score ? (
            <>
              {/* AI Reasoning */}
              <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="analytics" size={20} className="text-brand-gold" />
                    AI Analysis Summary
                  </CardTitle>
                  {candidate.scored_at && (
                    <CardDescription>
                      Scored on {new Date(candidate.scored_at).toLocaleString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {candidate.ai_reasoning || "No detailed analysis available."}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-brand-green">
                      <TrendingUp className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {candidate.ai_strengths && candidate.ai_strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {candidate.ai_strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No strengths identified.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Gaps */}
                <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-brand-pink">
                      <TrendingDown className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {candidate.ai_gaps && candidate.ai_gaps.length > 0 ? (
                      <ul className="space-y-2">
                        {candidate.ai_gaps.map((gap: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-brand-pink mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No gaps identified.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Score Breakdown */}
              <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="analytics" size={20} className="text-brand-teal" />
                    Score Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <ScoreBadge score={candidate.ai_score} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className="text-sm text-muted-foreground">{candidate.ai_score}/100</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            candidate.ai_score >= 80 ? "bg-green-500" :
                            candidate.ai_score >= 60 ? "bg-brand-gold" :
                            candidate.ai_score >= 40 ? "bg-orange-400" :
                            "bg-brand-pink"
                          }`}
                          style={{ width: `${candidate.ai_score}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Threshold: {candidate.jobs?.score_threshold ?? 70}%</span>
                        <span className={meetsThreshold ? "text-brand-green" : "text-brand-pink"}>
                          {meetsThreshold ? "Meets threshold" : "Below threshold"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Not Scored Yet
                </h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  This candidate hasn&apos;t been scored by AI yet. Scoring happens automatically
                  after application submission.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resume & Cover Letter Tab */}
        <TabsContent value="resume" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume */}
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="document" size={20} className="text-brand-gold" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.resume_url ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-brand-gold" />
                        <div>
                          <p className="font-medium">{candidate.resume_filename || "Resume"}</p>
                          <p className="text-sm text-muted-foreground">PDF Document</p>
                        </div>
                      </div>
                      <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>

                    {candidate.resume_text && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Extracted Text Preview:</p>
                        <div className="p-4 bg-muted/30 rounded-lg max-h-64 overflow-y-auto">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {candidate.resume_text.substring(0, 1000)}
                            {candidate.resume_text.length > 1000 && "..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No resume uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="communication" size={20} className="text-brand-teal" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.cover_letter ? (
                  <div className="p-4 bg-muted/30 rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {candidate.cover_letter}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No cover letter provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          {interviewsList.length === 0 ? (
            <Card className="border-dashed shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mb-4">
                  <Icon name="calendar" size={32} className="text-brand-green" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Interviews Scheduled
                </h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {meetsThreshold
                    ? "This candidate meets the score threshold and will be automatically scheduled."
                    : "This candidate is below the score threshold for automatic scheduling."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviewsList.map((interview) => (
                <Card key={interview.id} className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-brand-teal/10">
                          <Video className="h-6 w-6 text-brand-teal" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {new Date(interview.scheduled_at).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                interview.status === "scheduled" ? "bg-brand-teal/10 text-brand-teal" :
                                interview.status === "completed" ? "bg-brand-green/10 text-brand-green" :
                                interview.status === "cancelled" ? "bg-muted text-muted-foreground" :
                                "bg-brand-pink/10 text-brand-pink"
                              }
                            >
                              {interview.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>
                              {new Date(interview.scheduled_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {interview.duration_minutes && (
                              <span>{interview.duration_minutes} min</span>
                            )}
                            {interview.interviewer_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {interview.interviewer_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.meeting_link && interview.status === "scheduled" && (
                          <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                          </a>
                        )}
                        {interview.status === "completed" && !interview.feedback_submitted_at && (
                          <Link href={`/schedule/interviews/${interview.id}/feedback`}>
                            <Button size="sm" variant="outline">
                              Submit Feedback
                            </Button>
                          </Link>
                        )}
                        {interview.feedback_submitted_at && (
                          <Badge variant="outline" className="bg-brand-green/10 text-brand-green">
                            Feedback Submitted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
