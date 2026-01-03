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

export const dynamic = "force-dynamic";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  // Fetch candidates for this job with their interview info
  const { data: candidates } = await supabase
    .from("candidates")
    .select(`
      *,
      interviews (
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/schedule/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
              <JobStatusBadge status={job.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {job.department && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.department}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Created {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/schedule/jobs/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {job.status === "active" && (
            <Link href={`/jobs/${id}`} target="_blank">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{job.total_candidates || 0}</div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{job.scored_candidates || 0}</div>
            <p className="text-sm text-muted-foreground">Scored</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{job.invited_candidates || 0}</div>
            <p className="text-sm text-muted-foreground">Invited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{job.scheduled_candidates || 0}</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Public Link Card (for active jobs) */}
      {job.status === "active" && (
        <Card className="border-brand-green/30 bg-brand-green/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Job is Live!</p>
                  <p className="text-sm text-muted-foreground">
                    Share this link with candidates to apply
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 rounded bg-muted text-sm font-mono">
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
        <Card className="border-brand-gold/30 bg-brand-gold/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="font-medium text-foreground">Auto-Scheduling Enabled</p>
                <p className="text-sm text-muted-foreground">
                  Candidates scoring {job.score_threshold}% or higher are automatically scheduled for interviews based on available slots.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Candidates, Details */}
      <Tabs defaultValue="candidates">
        <TabsList>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            Candidates ({candidatesList.length})
          </TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
        </TabsList>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="mt-4">
          {candidatesList.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
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
            <Card>
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
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.requirements || "No requirements specified"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.responsibilities}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-score</span>
                  <Badge variant={job.auto_score ? "default" : "secondary"}>
                    {job.auto_score ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Score Threshold</span>
                  <span className="font-medium">{job.score_threshold}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
