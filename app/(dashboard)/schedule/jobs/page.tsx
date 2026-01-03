import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
  }

  const jobsList = jobs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Jobs</h2>
          <p className="text-muted-foreground">
            Manage your job postings and view candidates
          </p>
        </div>
        <Link href="/schedule/jobs/new">
          <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </Link>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">All Jobs ({jobsList.length})</CardTitle>
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
