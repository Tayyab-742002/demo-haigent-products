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
import { CandidateStatusBadge } from "@/components/sourcing/candidates/CandidateStatusBadge";
import { ScoreBadge } from "@/components/sourcing/candidates/ScoreBadge";
import {
  ArrowLeft,
  Mail,
  Linkedin,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  Award,
  Languages,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Building
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Candidate {
  id: string;
  candidate_id: string;
  role_id: string;
  name: string;
  email: string;
  linkedin_url: string;
  profile_picture_url: string;
  current_job_title: string;
  current_company: string;
  headline: string;
  location: string;
  experience_years: number;
  total_experience: number;
  total_education: number;
  total_skills: number;
  skills: string[];
  profile_summary: string;
  education: any[];
  positions: any[];
  languages: any[];
  certifications: any[];
  endorsements: any[];
  recommendations: any[];
  projects: any[];
  score: number;
  ai_analysis: {
    overall_fit: string;
    strengths: string[];
    concerns: string[];
    skill_matches: { skill: string; match: number }[];
    experience_relevance: string;
    education_relevance: string;
    recommendation: string;
  };
  status: string;
  source: string;
  created_at: string;
}

interface Role {
  role_id: string;
  title: string;
  department: string;
  skills: string[];
}

interface Outreach {
  id: string;
  outreach_id: string;
  email_subject: string;
  email_body: string;
  status: string;
  sent_at: string;
  opened_at: string;
  replied_at: string;
  reply_text: string;
  reply_sentiment: string;
}

interface Meeting {
  id: string;
  meeting_id: string;
  selected_date: string;
  selected_time: string;
  meeting_type: string;
  meeting_link: string;
  status: string;
  notes: string;
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely parse JSON fields
  const parseJSONField = (field: any): any => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    const supabase = createClient();

    // Fetch candidate
    const { data: candidateData, error: candidateError } = await supabase
      .from("sourcing_candidates")
      .select("*")
      .eq("id", id)
      .single();

    if (candidateError) {
      console.error("Error fetching candidate:", candidateError);
      setIsLoading(false);
      return;
    }

    // Parse JSON string fields
    const parsedCandidate = {
      ...candidateData,
      skills: parseJSONField(candidateData.skills),
      education: parseJSONField(candidateData.education),
      positions: parseJSONField(candidateData.positions),
      languages: parseJSONField(candidateData.languages),
      certifications: parseJSONField(candidateData.certifications),
      endorsements: parseJSONField(candidateData.endorsements),
      recommendations: parseJSONField(candidateData.recommendations),
      projects: parseJSONField(candidateData.projects),
      ai_analysis: candidateData.ai_analysis || {},
    };

    setCandidate(parsedCandidate);

    // Fetch role
    const { data: roleData } = await supabase
      .from("sourcing_roles")
      .select("role_id, title, department, skills")
      .eq("role_id", candidateData.role_id)
      .single();

    setRole(roleData);

    // Fetch outreach
    const { data: outreachData } = await supabase
      .from("sourcing_outreach")
      .select("*")
      .eq("candidate_id", candidateData.candidate_id)
      .order("created_at", { ascending: false });

    setOutreach(outreachData || []);

    // Fetch meetings
    const { data: meetingsData } = await supabase
      .from("sourcing_meetings")
      .select("*")
      .eq("candidate_id", candidateData.candidate_id)
      .order("selected_date", { ascending: false });

    setMeetings(meetingsData || []);

    setIsLoading(false);
  };

  const updateCandidateStatus = async (newStatus: string) => {
    if (!candidate) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("sourcing_candidates")
      .update({ status: newStatus })
      .eq("id", candidate.id);

    if (!error) {
      setCandidate({ ...candidate, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Candidate not found</h2>
          <Button onClick={() => router.push("/sourcing/candidates")} className="mt-4">
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/sourcing/candidates")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Profile Picture */}
          {candidate.profile_picture_url ? (
            <img
              src={candidate.profile_picture_url}
              alt={candidate.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{candidate.name}</h1>
              {candidate.score && <ScoreBadge score={candidate.score} size="lg" />}
              <CandidateStatusBadge status={candidate.status} />
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              {candidate.current_job_title} at {candidate.current_company}
            </p>
            {candidate.headline && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {candidate.headline}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {candidate.location}
                </span>
              )}
              {candidate.experience_years && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {candidate.experience_years}+ years experience
                </span>
              )}
              {candidate.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {candidate.linkedin_url && (
            <Button variant="outline" asChild>
              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn Profile
              </a>
            </Button>
          )}
          {candidate.status === "new" && (
            <>
              <Button onClick={() => updateCandidateStatus("qualified")} variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Qualify
              </Button>
              <Button onClick={() => updateCandidateStatus("rejected")} variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Analysis Section */}
      {candidate.ai_analysis && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="analytics" size={24} />
              AI Analysis
            </CardTitle>
            <CardDescription>
              Powered by Claude - Automated candidate evaluation based on role requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Fit */}
            {candidate.ai_analysis.overall_fit && (
              <div>
                <h4 className="font-semibold mb-2">Overall Fit</h4>
                <p className="text-muted-foreground">{candidate.ai_analysis.overall_fit}</p>
              </div>
            )}

            {/* Score Breakdown */}
            {candidate.score !== null && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Overall Score</p>
                  <div className="flex items-center gap-3">
                    <Progress value={candidate.score * 10} className="h-3" />
                    <span className="text-2xl font-bold">{candidate.score.toFixed(1)}</span>
                  </div>
                </div>
                {candidate.ai_analysis.skill_matches && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills Match</p>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={
                          (candidate.ai_analysis.skill_matches.reduce((acc, s) => acc + s.match, 0) /
                            candidate.ai_analysis.skill_matches.length) *
                          100
                        }
                        className="h-3"
                      />
                      <span className="text-2xl font-bold">
                        {(
                          (candidate.ai_analysis.skill_matches.reduce((acc, s) => acc + s.match, 0) /
                            candidate.ai_analysis.skill_matches.length) *
                          10
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-2">Experience Fit</p>
                  <div className="flex items-center gap-3">
                    <Progress value={candidate.score * 10} className="h-3" />
                    <span className="text-2xl font-bold">{candidate.score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.ai_analysis.strengths && candidate.ai_analysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {candidate.ai_analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {candidate.ai_analysis.concerns && candidate.ai_analysis.concerns.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <ExternalLink className="h-5 w-5" />
                    Areas to Explore
                  </h4>
                  <ul className="space-y-2">
                    {candidate.ai_analysis.concerns.map((concern, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">!</span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation */}
            {candidate.ai_analysis.recommendation && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendation
                </h4>
                <p className="text-sm">{candidate.ai_analysis.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="outreach">Outreach ({outreach.length})</TabsTrigger>
          <TabsTrigger value="meetings">Meetings ({meetings.length})</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Role Information */}
          {role && (
            <Card>
              <CardHeader>
                <CardTitle>Applied for Role</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/sourcing/roles/${role.role_id}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {role.title}
                </Link>
                {role.department && (
                  <p className="text-sm text-muted-foreground mt-1">{role.department}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profile Summary */}
          {candidate.profile_summary && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{candidate.profile_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="goal" size={20} />
                  Skills & Expertise ({candidate.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => {
                    const roleHasSkill =
                      role?.skills &&
                      Array.isArray(role.skills) &&
                      role.skills.some((rs) => rs.toLowerCase() === skill.toLowerCase());

                    return (
                      <Badge
                        key={index}
                        variant={roleHasSkill ? "default" : "secondary"}
                        className={roleHasSkill ? "border-2 border-primary" : ""}
                      >
                        {skill}
                        {roleHasSkill && " ✓"}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {candidate.languages && Array.isArray(candidate.languages) && candidate.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {candidate.languages.map((lang: any, index: number) => {
                    const languageName = typeof lang === 'string' ? lang : (lang?.name || 'Unknown');
                    const proficiency = typeof lang === 'object' ? lang?.proficiency : null;

                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span>{languageName}</span>
                        {proficiency && (
                          <Badge variant="outline">{proficiency}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {candidate.projects && Array.isArray(candidate.projects) && candidate.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidate.projects.map((project: any, index: number) => (
                    <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                      <h4 className="font-semibold">{project.title || project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {project.description}
                        </p>
                      )}
                      {project.timePeriod && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.timePeriod}
                        </p>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-teal hover:underline mt-1 inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endorsements */}
          {candidate.endorsements && Array.isArray(candidate.endorsements) && candidate.endorsements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Endorsements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {candidate.endorsements.map((endorsement: any, index: number) => {
                    const skillName = typeof endorsement === 'string' ? endorsement : (endorsement?.skill || endorsement?.name || 'Unknown');
                    const count = typeof endorsement === 'object' ? endorsement?.count : null;

                    return (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm">{skillName}</span>
                        {count && (
                          <Badge variant="secondary">{count} endorsements</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {candidate.recommendations && Array.isArray(candidate.recommendations) && candidate.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidate.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                      {rec.recommenderName && (
                        <div className="flex items-start gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-sm">{rec.recommenderName}</p>
                            {rec.recommenderTitle && (
                              <p className="text-xs text-muted-foreground">{rec.recommenderTitle}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {rec.text && (
                        <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                          "{rec.text}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {candidate.source && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Source</p>
                    <p className="text-sm mt-1">{candidate.source}</p>
                  </div>
                )}
                {candidate.created_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Added</p>
                    <p className="text-sm mt-1">
                      {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                    </p>
                  </div>
                )}
                {candidate.total_experience !== null && candidate.total_experience !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Experience</p>
                    <p className="text-sm mt-1">{candidate.total_experience} positions</p>
                  </div>
                )}
                {candidate.total_education !== null && candidate.total_education !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Education</p>
                    <p className="text-sm mt-1">{candidate.total_education} degrees</p>
                  </div>
                )}
                {candidate.total_skills !== null && candidate.total_skills !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                    <p className="text-sm mt-1">{candidate.total_skills} skills</p>
                  </div>
                )}
                {candidate.candidate_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Candidate ID</p>
                    <p className="text-sm mt-1 font-mono truncate">{candidate.candidate_id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          {candidate.positions && Array.isArray(candidate.positions) && candidate.positions.length > 0 ? (
            candidate.positions.map((position: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {position.companyLogo && (
                      <img
                        src={position.companyLogo}
                        alt={position.companyName}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{position.title}</h3>
                      <p className="text-muted-foreground">{position.companyName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {position.start} - {position.end || "Present"}
                        </span>
                        {position.location && (
                          <>
                            <span>•</span>
                            <span>{position.location}</span>
                          </>
                        )}
                      </div>
                      {position.description && (
                        <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                          {position.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No experience information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          {candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0 ? (
            <>
              <div className="space-y-4">
                {candidate.education.map((edu: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{edu.schoolName}</h3>
                          <p className="text-muted-foreground">
                            {edu.degreeName} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                          </p>
                          {(edu.start || edu.end) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {edu.start} - {edu.end || "Present"}
                              </span>
                            </div>
                          )}
                          {edu.description && (
                            <p className="mt-2 text-sm text-muted-foreground">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Certifications */}
              {candidate.certifications && Array.isArray(candidate.certifications) && candidate.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {candidate.certifications.map((cert: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            {cert.authority && (
                              <p className="text-sm text-muted-foreground">{cert.authority}</p>
                            )}
                            {cert.timePeriod && (
                              <p className="text-xs text-muted-foreground mt-1">{cert.timePeriod}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No education information available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4">
          {outreach.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No outreach emails sent yet</p>
                <Button className="mt-4">Send Outreach Email</Button>
              </CardContent>
            </Card>
          ) : (
            outreach.map((email) => (
              <Card key={email.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{email.email_subject}</CardTitle>
                    <Badge variant={email.status === "sent" ? "default" : "secondary"}>
                      {email.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {email.sent_at && `Sent ${formatDistanceToNow(new Date(email.sent_at), { addSuffix: true })}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{email.email_body}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {email.opened_at && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Opened {formatDistanceToNow(new Date(email.opened_at), { addSuffix: true })}
                      </span>
                    )}
                    {email.replied_at && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Mail className="h-4 w-4" />
                        Replied {formatDistanceToNow(new Date(email.replied_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {email.reply_text && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold mb-2">Reply:</p>
                      <p className="text-sm whitespace-pre-wrap">{email.reply_text}</p>
                      {email.reply_sentiment && (
                        <Badge variant="outline" className="mt-2">
                          Sentiment: {email.reply_sentiment}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No meetings scheduled yet</p>
                <Button className="mt-4">Schedule Meeting</Button>
              </CardContent>
            </Card>
          ) : (
            meetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{meeting.meeting_type}</h3>
                        <Badge variant={meeting.status === "confirmed" ? "default" : "secondary"}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(meeting.selected_time).toLocaleString()}
                        </p>
                        {meeting.notes && (
                          <p className="text-sm mt-2">{meeting.notes}</p>
                        )}
                      </div>
                    </div>
                    {meeting.meeting_link && (
                      <Button variant="outline" asChild>
                        <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Meeting
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
