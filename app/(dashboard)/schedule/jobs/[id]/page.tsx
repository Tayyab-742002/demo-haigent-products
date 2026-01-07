import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobStatusBadge } from "@/components/schedule/jobs/JobStatusBadge";
import { CandidateStatusBadge } from "@/components/schedule/candidates/CandidateStatusBadge";
import { ScoreBadge } from "@/components/schedule/candidates/ScoreBadge";
import {
  ArrowLeft,
  Pencil,
  ExternalLink,
  Users,
  Clock,
  MapPin,
  Briefcase,
  CheckCircle,
  Calendar,
  Zap,
  Eye,
} from "lucide-react";
import { CopyButton } from "@/components/shared/CopyButton";
import { Icon } from "@/components/ui/icon";
import { getAgent } from "@/lib/constants/agents";

export const dynamic = "force-dynamic";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("schedule_jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  // Fetch candidates for this job with their interview info
  const { data: candidates } = await supabase
    .from("schedule_candidates")
    .select(`
      *,
      schedule_interviews!inner (
        id,
        scheduled_at,
        status,
        interviewer_name
      )
    `)
    .eq("job_id", id)
    .order("ai_score", { ascending: false, nullsFirst: false });

  const candidatesList = candidates || [];

  // Generate public job URL
  const publicJobUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/jobs/${id}`;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/schedule/jobs">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            {job.department && (
              <span className="flex items-center gap-1.5">
                <Icon name="briefcase" size={14} />
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Created {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/schedule/jobs/${id}/edit`}>
            <Button className={`bg-${secondaryColor} hover:brightness-110 text-brand-charcoal`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          </Link>
          {job.status === "active" && (
            <Link href={`/jobs/${id}`} target="_blank">
              <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green/10">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="users" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Total</p>
                <p className="text-2xl font-bold text-brand-charcoal">{job.total_candidates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="analytics" size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Scored</p>
                <p className="text-2xl font-bold text-brand-charcoal">{job.scored_candidates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="communication" size={20} className="text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Invited</p>
                <p className="text-2xl font-bold text-brand-charcoal">{job.invited_candidates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-green shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="checklist" size={20} className="text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-brand-charcoal">{job.scheduled_candidates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public Link Card (for active jobs) */}
      {job.status === "active" && (
        <Card className="bg-brand-green/20 border-brand-green/30 shadow-md">
          <CardContent className="py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Job is Live!</p>
                  <p className="text-sm text-brand-charcoal/70">
                    Share this link with candidates to apply
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-4 py-2 rounded-lg bg-white/80 text-sm font-mono text-brand-charcoal border border-brand-green/20">
                  {publicJobUrl}
                </code>
                <CopyButton text={publicJobUrl} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Scheduling Info */}
      {job.auto_score && (
        <Card className="bg-brand-gold/20 border-brand-gold/30 shadow-md">
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">Auto-Scheduling Enabled</p>
                <p className="text-sm text-brand-charcoal/70">
                  Candidates scoring {job.score_threshold}% or higher are automatically scheduled for interviews based on available slots.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Candidates, Details */}
      <Tabs defaultValue="candidates" className="mt-2">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="candidates" className="gap-2 data-[state=active]:bg-brand-pink data-[state=active]:text-white">
            <Icon name="users" size={16} />
            Candidates ({candidatesList.length})
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2 data-[state=active]:bg-brand-teal data-[state=active]:text-white">
            <Icon name="briefcase" size={16} />
            Job Details
          </TabsTrigger>
        </TabsList>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="mt-6">
          {candidatesList.length === 0 ? (
            <Card className="border-dashed shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-brand-teal/20 flex items-center justify-center mb-4">
                  <Icon name="users" size={40} className="text-brand-teal" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No candidates yet
                </h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {job.status === "active"
                    ? "Share the public job link to start receiving applications."
                    : "Publish this job to start receiving applications."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="users" size={20} className="text-brand-teal" />
                    Candidate Applications
                  </CardTitle>
                  <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                    {candidatesList.length} Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Score</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Interview</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesList.map((candidate) => {
                      const interview = candidate.interviews?.[0];
                      return (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <ScoreBadge score={candidate.ai_score} size="sm" />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {candidate.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {candidate.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <CandidateStatusBadge status={candidate.status} />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {candidate.current_title && (
                                <p className="font-medium">{candidate.current_title}</p>
                              )}
                              {candidate.current_company && (
                                <p className="text-muted-foreground">
                                  {candidate.current_company}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {interview ? (
                              <div className="text-sm">
                                <div className="flex items-center gap-1.5 text-brand-teal">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span className="font-medium">
                                    {new Date(interview.scheduled_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(interview.scheduled_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {interview.interviewer_name && ` • ${interview.interviewer_name}`}
                                </p>
                              </div>
                            ) : candidate.status === "scored" && candidate.ai_score >= job.score_threshold ? (
                              <span className="text-xs text-muted-foreground italic">
                                Scheduling...
                              </span>
                            ) : candidate.ai_score && candidate.ai_score < job.score_threshold ? (
                              <span className="text-xs text-muted-foreground">
                                Below threshold
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(candidate.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Link href={`/schedule/candidates/${candidate.id}`}>
                              <Button size="sm" variant="ghost" title="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Job Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md border-l-4 border-l-brand-pink">
              <CardHeader className="bg-brand-pink/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="checklist" size={20} className="text-brand-pink" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {job.requirements || "No requirements specified"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-brand-teal">
              <CardHeader className="bg-brand-teal/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="briefcase" size={20} className="text-brand-teal" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            {job.responsibilities && (
              <Card className="shadow-md border-l-4 border-l-brand-green">
                <CardHeader className="bg-brand-green/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="goal" size={20} className="text-brand-green" />
                    Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {job.responsibilities}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-md border-l-4 border-l-brand-gold">
              <CardHeader className="bg-brand-gold/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="workflow" size={20} className="text-brand-gold" />
                  AI Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">Auto-score</span>
                  <Badge
                    variant={job.auto_score ? "default" : "secondary"}
                    className={job.auto_score ? "bg-brand-green text-white" : ""}
                  >
                    {job.auto_score ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">Score Threshold</span>
                  <span className="font-bold text-brand-gold text-lg">{job.score_threshold}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
