import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateStatusBadge } from "@/components/schedule/candidates/CandidateStatusBadge";
import { ScoreBadge } from "@/components/schedule/candidates/ScoreBadge";
import { getAgent } from "@/lib/constants/agents";
import { Icon } from "@/components/ui/icon";
import { Users, Eye, ArrowUpDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const supabase = await createClient();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  // Fetch all candidates with job information
  const { data: candidates, error } = await supabase
    .from("schedule_candidates")
    .select(`
      *,
      schedule_jobs!inner (
        id,
        title,
        department,
        location
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching candidates:", error);
  }

  const candidatesList = candidates || [];

  // Calculate stats
  const totalCandidates = candidatesList.length;
  const scoredCandidates = candidatesList.filter((c) => c.ai_score !== null).length;
  const invitedCandidates = candidatesList.filter((c) => c.status === "invited").length;
  const scheduledCandidates = candidatesList.filter((c) => c.status === "scheduled").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row bg-${primaryColor} rounded-xl p-4 sm:items-center sm:justify-between gap-4`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Icon name="users" size={32} className="text-white" />
            Candidates
          </h1>
          <p className="text-white/80 mt-1">
            View and manage all candidate applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="users" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Total Candidates</p>
                <p className="text-2xl font-bold text-brand-charcoal">{totalCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="analytics" size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">AI Scored</p>
                <p className="text-2xl font-bold text-brand-charcoal">{scoredCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="communication" size={20} className="text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Invited</p>
                <p className="text-2xl font-bold text-brand-charcoal">{invitedCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-green shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="checklist" size={20} className="text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-brand-charcoal">{scheduledCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Table or Empty State */}
      {candidatesList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No candidates yet
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Once candidates apply to your job postings, they will appear here with
              AI scoring and analysis.
            </p>
            <Link href="/schedule/jobs/new">
              <Button className={`bg-${primaryColor} hover:brightness-110 text-brand-charcoal transition-all`}>
                <Icon name="briefcase" size={16} className="mr-2" />
                Create a Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="users" size={20} className={`text-${primaryColor}`} />
                All Candidates ({candidatesList.length})
              </CardTitle>
              <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                {scheduledCandidates} Scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      AI Score
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatesList.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/schedule/candidates/${candidate.id}`}
                          className="font-medium text-foreground hover:text-brand-teal transition-colors"
                        >
                          {candidate.name}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {candidate.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {candidate.jobs ? (
                        <Link
                          href={`/schedule/jobs/${candidate.job_id}`}
                          className="hover:text-brand-teal transition-colors"
                        >
                          <div>
                            <p className="font-medium">{candidate.jobs.title}</p>
                            {candidate.jobs.department && (
                              <p className="text-sm text-muted-foreground">
                                {candidate.jobs.department}
                              </p>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <ScoreBadge score={candidate.ai_score} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <CandidateStatusBadge status={candidate.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/schedule/candidates/${candidate.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
