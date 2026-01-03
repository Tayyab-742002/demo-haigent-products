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
  Users,
  Plus,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InterviewersPage() {
  const supabase = await createClient();

  // Fetch interviewers
  const { data: interviewers } = await supabase
    .from("interviewers")
    .select("*")
    .order("name", { ascending: true });

  const interviewersList = interviewers || [];

  // Get interview counts for each interviewer
  const { data: interviewCounts } = await supabase
    .from("interviews")
    .select("interviewer_id, status")
    .in(
      "interviewer_id",
      interviewersList.map((i) => i.id)
    );

  // Calculate stats per interviewer
  const statsMap = new Map<string, { total: number; completed: number }>();
  interviewCounts?.forEach((interview) => {
    const current = statsMap.get(interview.interviewer_id) || { total: 0, completed: 0 };
    current.total += 1;
    if (interview.status === "completed") {
      current.completed += 1;
    }
    statsMap.set(interview.interviewer_id, current);
  });

  const activeInterviewers = interviewersList.filter((i) => i.is_active);
  const inactiveInterviewers = interviewersList.filter((i) => !i.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interviewers</h2>
          <p className="text-muted-foreground">
            Manage your interview team and availability
          </p>
        </div>
        <Link href="/schedule/interviewers/new">
          <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal">
            <Plus className="h-4 w-4 mr-2" />
            Add Interviewer
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{interviewersList.length}</div>
            <p className="text-sm text-muted-foreground">Total Interviewers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeInterviewers.length}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {interviewCounts?.filter((i) => i.status === "scheduled").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Scheduled Interviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {interviewCounts?.filter((i) => i.status === "completed").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Interviewers List */}
      {interviewersList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No interviewers yet
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Add your team members who will conduct interviews with candidates.
            </p>
            <Link href="/schedule/interviewers/new">
              <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal">
                <Plus className="h-4 w-4 mr-2" />
                Add First Interviewer
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviewersList.map((interviewer) => {
                  const stats = statsMap.get(interviewer.id) || { total: 0, completed: 0 };
                  return (
                    <TableRow key={interviewer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-gold/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-brand-gold">
                              {interviewer.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{interviewer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-sm">{interviewer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {interviewer.title && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{interviewer.title}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {interviewer.department || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">
                            {stats.completed}/{stats.total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {interviewer.is_active ? (
                          <Badge
                            variant="outline"
                            className="bg-brand-green/10 text-brand-green border-brand-green/20"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/schedule/interviewers/${interviewer.id}/edit`}>
                          <Button size="sm" variant="outline">
                            Edit
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

      {/* Auto-Scheduling Info */}
      <Card className="border-brand-gold/30 bg-brand-gold/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                Auto-Scheduling Active
              </h4>
              <p className="text-sm text-muted-foreground">
                When candidates apply and score above the threshold, they are automatically
                scheduled for interviews based on interviewer availability. No manual
                invitation needed - the system finds the next available slot and sends
                confirmation emails to both parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-brand-teal" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                Interviewer Availability
              </h4>
              <p className="text-sm text-muted-foreground">
                Each interviewer has configurable availability slots. The system automatically
                checks for conflicts and schedules interviews during available times. Set
                max interviews per day to prevent overbooking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
