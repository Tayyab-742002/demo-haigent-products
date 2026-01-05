import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Briefcase,
  Plus,
  CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";

type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";

function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const variants: Record<InterviewStatus, { label: string; className: string }> = {
    scheduled: {
      label: "Scheduled",
      className: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
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
  };

  const variant = variants[status] || variants.scheduled;

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

export default async function InterviewsPage() {
  const supabase = await createClient();

  // Fetch interviews with candidate and job info
  const { data: interviews } = await supabase
    .from("interviews")
    .select(`
      *,
      candidates (
        id,
        name,
        email,
        current_title,
        current_company
      ),
      jobs (
        id,
        title,
        department
      )
    `)
    .order("scheduled_at", { ascending: true });

  const interviewsList = interviews || [];

  // Separate upcoming and past interviews
  const now = new Date();
  const upcomingInterviews = interviewsList.filter(
    (i) => new Date(i.scheduled_at) >= now && i.status === "scheduled"
  );
  const pastInterviews = interviewsList.filter(
    (i) => new Date(i.scheduled_at) < now || i.status !== "scheduled"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interviews</h2>
          <p className="text-muted-foreground">
            Manage scheduled interviews and view history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{upcomingInterviews.length}</div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {interviewsList.filter((i) => i.status === "completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {interviewsList.filter((i) => i.status === "cancelled").length}
            </div>
            <p className="text-sm text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {interviewsList.filter((i) => i.status === "no_show").length}
            </div>
            <p className="text-sm text-muted-foreground">No Shows</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-brand-gold" />
          Upcoming Interviews
        </h3>

        {upcomingInterviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No upcoming interviews
              </h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                When candidates book interviews, they will appear here.
              </p>
              <Link href="/schedule/jobs">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  View Jobs & Candidates
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(interview.scheduled_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(interview.scheduled_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {interview.duration_minutes && ` (${interview.duration_minutes} min)`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/schedule/interviews/${interview.id}`} className="block hover:underline">
                          <p className="font-medium">{interview.candidates?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {interview.candidates?.email}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{interview.jobs?.title}</p>
                          {interview.jobs?.department && (
                            <p className="text-sm text-muted-foreground">
                              {interview.jobs.department}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {interview.interview_type === "video" ? (
                            <Video className="h-4 w-4 text-brand-teal" />
                          ) : (
                            <MapPin className="h-4 w-4 text-brand-gold" />
                          )}
                          <span className="text-sm capitalize">
                            {interview.interview_type || "Video"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {interview.interviewer_name || "TBD"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <InterviewStatusBadge status={interview.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {interview.meeting_link && (
                            <a
                              href={interview.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                Join
                              </Button>
                            </a>
                          )}
                          <Link href={`/schedule/interviews/${interview.id}/feedback`}>
                            <Button size="sm" variant="ghost">
                              Feedback
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Past Interviews
          </h3>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(interview.scheduled_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/schedule/interviews/${interview.id}`} className="hover:underline">
                          <p className="font-medium">{interview.candidates?.name}</p>
                        </Link>
                      </TableCell>
                      <TableCell>{interview.jobs?.title}</TableCell>
                      <TableCell>{interview.interviewer_name || "N/A"}</TableCell>
                      <TableCell>
                        <InterviewStatusBadge status={interview.status} />
                      </TableCell>
                      <TableCell>
                        <Link href={`/schedule/interviews/${interview.id}/feedback`}>
                          <Button size="sm" variant="ghost">
                            {interview.feedback_submitted_at ? "View" : "Feedback"}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
