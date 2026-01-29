"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import { RoleStatusBadge } from "@/components/sourcing/roles/RoleStatusBadge";
import { CandidateStatusBadge } from "@/components/sourcing/candidates/CandidateStatusBadge";
import { ScoreBadge } from "@/components/sourcing/candidates/ScoreBadge";
import { OutreachStatusBadge } from "@/components/sourcing/outreach/OutreachStatusBadge";
import { ArrowLeft, Edit, Play, Pause, Linkedin, ExternalLink, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Role {
  id: string;
  role_id: string;
  title: string;
  department: string;
  location: string;
  experience_required: string;
  description: string;
  skills: string[];
  salary_range: string;
  status: string;
  company_name: string;
  total_candidates: number;
  candidates_scored: number;
  candidates_qualified: number;
  emails_sent: number;
  emails_replied: number;
  meetings_scheduled: number;
  created_at: string;
  updated_at: string;
}

interface Candidate {
  id: string;
  candidate_id: string;
  name: string;
  email: string;
  linkedin_url: string;
  profile_picture_url: string;
  current_job_title: string;
  current_company: string;
  location: string;
  experience_years: number;
  score: number;
  status: string;
  created_at: string;
}

interface Outreach {
  id: string;
  outreach_id: string;
  candidate_id: string;
  email_subject: string;
  email_body: string;
  status: string;
  sent_at: string;
  opened_at: string;
  clicked_at: string;
  replied_at: string;
  reply_sentiment: string;
  candidate: {
    name: string;
    email: string;
  };
}

interface Meeting {
  id: string;
  meeting_id: string;
  candidate_id: string;
  selected_date: string;
  selected_time: string;
  meeting_type: string;
  meeting_link: string;
  status: string;
  created_at: string;
  candidate: {
    name: string;
    email: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  metadata: any;
  created_at: string;
}

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.role_id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoleDetails();
  }, [roleId]);

  const fetchRoleDetails = async () => {
    const supabase = createClient();

    // Fetch role
    const { data: roleData, error: roleError } = await supabase
      .from("sourcing_roles")
      .select("*")
      .eq("role_id", roleId)
      .single();

    if (roleError) {
      console.error("Error fetching role:", roleError);
      setIsLoading(false);
      return;
    }

    setRole(roleData);

    // Fetch candidates for this role
    const { data: candidatesData } = await supabase
      .from("sourcing_candidates")
      .select("*")
      .eq("role_id", roleId)
      .order("score", { ascending: false });

    setCandidates(candidatesData || []);

    // Fetch outreach for this role
    const { data: outreachData } = await supabase
      .from("sourcing_outreach")
      .select(`
        *,
        candidate:sourcing_candidates!inner(name, email)
      `)
      .eq("role_id", roleId)
      .order("created_at", { ascending: false });

    setOutreach(outreachData || []);

    // Fetch meetings for this role
    const { data: meetingsData } = await supabase
      .from("sourcing_meetings")
      .select(`
        *,
        candidate:sourcing_candidates!inner(name, email)
      `)
      .eq("role_id", roleId)
      .order("selected_date", { ascending: false });

    setMeetings(meetingsData || []);

    // Fetch activity logs for this role
    const { data: activityData } = await supabase
      .from("sourcing_activity_logs")
      .select("*")
      .eq("entity_type", "role")
      .order("created_at", { ascending: false })
      .limit(20);

    setActivities(activityData || []);

    setIsLoading(false);
  };

  const toggleRoleStatus = async () => {
    if (!role) return;

    const supabase = createClient();
    const newStatus = role.status === "active" ? "paused" : "active";

    const { error } = await supabase
      .from("sourcing_roles")
      .update({ status: newStatus })
      .eq("role_id", roleId);

    if (!error) {
      setRole({ ...role, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading role details...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Role not found</h2>
          <Button onClick={() => router.push("/sourcing/roles")} className="mt-4">
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  const sourcingProgress = role.total_candidates > 0
    ? (role.candidates_qualified / role.total_candidates) * 100
    : 0;

  const outreachProgress = role.emails_sent > 0
    ? (role.emails_replied / role.emails_sent) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/sourcing/roles")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{role.title}</h1>
              <RoleStatusBadge status={role.status} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {role.department && (
                <div className="flex items-center gap-1">
                  <Icon name="briefcase" size={14} />
                  <span>{role.department}</span>
                </div>
              )}
              {role.location && (
                <div className="flex items-center gap-1">
                  <Icon name="remote" size={14} />
                  <span>{role.location}</span>
                </div>
              )}
              {role.experience_required && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{role.experience_required}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={toggleRoleStatus}
          >
            {role.status === "active" ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Campaign
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Campaign
              </>
            )}
          </Button>
          <Button
            onClick={() => router.push(`/sourcing/roles/${roleId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Role
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                <p className="text-3xl font-bold mt-1">{role.total_candidates}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role.candidates_scored} scored
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Icon name="users" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualified</p>
                <p className="text-3xl font-bold mt-1">{role.candidates_qualified}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Score ≥ 7.0
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Icon name="trending-up" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-3xl font-bold mt-1">{role.emails_sent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role.emails_replied} replies
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Icon name="mail" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meetings</p>
                <p className="text-3xl font-bold mt-1">{role.meetings_scheduled}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Icon name="calendar" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Sourcing Progress</p>
                <p className="text-sm text-muted-foreground">
                  {role.candidates_qualified}/{role.total_candidates} qualified
                </p>
              </div>
              <Progress value={sourcingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {sourcingProgress.toFixed(1)}% of candidates qualified
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Outreach Response Rate</p>
                <p className="text-sm text-muted-foreground">
                  {role.emails_replied}/{role.emails_sent} replied
                </p>
              </div>
              <Progress value={outreachProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {outreachProgress.toFixed(1)}% response rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Details & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Information Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {role.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            )}

            {role.skills && Array.isArray(role.skills) && role.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {role.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {role.salary_range && (
              <div>
                <p className="text-sm font-medium mb-1">Salary Range</p>
                <p className="text-sm text-muted-foreground">{role.salary_range}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-1">Company</p>
              <p className="text-sm text-muted-foreground">{role.company_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(role.created_at), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="candidates" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="candidates">
                Candidates ({candidates.length})
              </TabsTrigger>
              <TabsTrigger value="outreach">
                Outreach ({outreach.length})
              </TabsTrigger>
              <TabsTrigger value="meetings">
                Meetings ({meetings.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="space-y-4">
              {candidates.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Icon name="users" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No candidates sourced yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The AI will automatically source candidates based on role requirements
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {candidates.map((candidate) => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {candidate.profile_picture_url && (
                              <img
                                src={candidate.profile_picture_url}
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  href={`/sourcing/candidates/${candidate.id}`}
                                  className="font-semibold hover:underline"
                                >
                                  {candidate.name}
                                </Link>
                                {candidate.score && <ScoreBadge score={candidate.score} />}
                                <CandidateStatusBadge status={candidate.status} />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {candidate.current_job_title} at {candidate.current_company}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                {candidate.location && (
                                  <span className="flex items-center gap-1">
                                    <Icon name="remote" size={12} />
                                    {candidate.location}
                                  </span>
                                )}
                                {candidate.experience_years && (
                                  <span>{candidate.experience_years}+ years exp</span>
                                )}
                                {candidate.linkedin_url && (
                                  <a
                                    href={candidate.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-primary"
                                  >
                                    <Linkedin className="h-3 w-3" />
                                    LinkedIn
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/sourcing/candidates/${candidate.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Outreach Tab */}
            <TabsContent value="outreach" className="space-y-4">
              {outreach.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Icon name="mail" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No outreach emails sent yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {outreach.map((email) => (
                    <Card key={email.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{email.candidate.name}</p>
                              <OutreachStatusBadge status={email.status} />
                              {email.reply_sentiment && (
                                <Badge variant={email.reply_sentiment === "positive" ? "default" : "secondary"}>
                                  {email.reply_sentiment}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{email.email_subject}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {email.sent_at && (
                                <span>Sent {formatDistanceToNow(new Date(email.sent_at), { addSuffix: true })}</span>
                              )}
                              {email.opened_at && (
                                <span className="text-green-600">Opened</span>
                              )}
                              {email.replied_at && (
                                <span className="text-blue-600">Replied</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Meetings Tab */}
            <TabsContent value="meetings" className="space-y-4">
              {meetings.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Icon name="calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No meetings scheduled yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{meeting.candidate.name}</p>
                              <Badge variant={meeting.status === "confirmed" ? "default" : "secondary"}>
                                {meeting.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{meeting.meeting_type}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(meeting.selected_time).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {meeting.meeting_link && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Join
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              {activities.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No activity yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            <Icon name="analytics" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action.replace(/\./g, " ")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
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
      </div>
    </div>
  );
}
