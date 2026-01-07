import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobStatusBadge } from "@/components/schedule/jobs/JobStatusBadge";
import { getAgent } from "@/lib/constants/agents";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Users,
  ExternalLink,
  Briefcase,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = await createClient();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
  }

  const jobsList = jobs || [];

  // Calculate stats
  const totalJobs = jobsList.length;
  const activeJobs = jobsList.filter(j => j.status === "active").length;
  const draftJobs = jobsList.filter(j => j.status === "draft").length;
  const closedJobs = jobsList.filter(j => j.status === "closed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row bg-${primaryColor} rounded-xl p-4 sm:items-center sm:justify-between gap-4`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Icon name="briefcase" size={32} className="text-white" />
            Job Openings
          </h1>
          <p className="text-white/80 mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        <Link href="/schedule/jobs/new">
          <Button className={`bg-${secondaryColor} hover:brightness-110 text-brand-charcoal transition-all`}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="briefcase" size={20} className="text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-brand-charcoal">{totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-green shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="trending-up" size={20} className="text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Active</p>
                <p className="text-2xl font-bold text-brand-charcoal">{activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="workflow" size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Draft</p>
                <p className="text-2xl font-bold text-brand-charcoal">{draftJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="checklist" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Closed</p>
                <p className="text-2xl font-bold text-brand-charcoal">{closedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table or Empty State */}
      {jobsList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No jobs yet
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Create your first job posting to start receiving applications and
              scheduling interviews.
            </p>
            <Link href="/schedule/jobs/new">
              <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="briefcase" size={20} className={`text-${primaryColor}`} />
                All Jobs ({jobsList.length})
              </CardTitle>
              <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                {activeJobs} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Candidates</TableHead>
                  <TableHead className="text-center">Scored</TableHead>
                  <TableHead className="text-center">Scheduled</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobsList.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/schedule/jobs/${job.id}`}
                          className="font-medium text-foreground hover:text-brand-teal transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {job.department && <span>{job.department}</span>}
                          {job.department && job.location && <span> · </span>}
                          {job.location && <span>{job.location}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{job.total_candidates || 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{job.scored_candidates || 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{job.scheduled_candidates || 0}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/schedule/jobs/${job.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/schedule/jobs/${job.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Job
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/schedule/jobs/${job.id}`}>
                              <Users className="h-4 w-4 mr-2" />
                              View Candidates
                            </Link>
                          </DropdownMenuItem>
                          {job.status === "active" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.id}`} target="_blank">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Public Page
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
