"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateStatusBadge } from "@/components/sourcing/candidates/CandidateStatusBadge";
import { ScoreBadge } from "@/components/sourcing/candidates/ScoreBadge";
import { Icon } from "@/components/ui/icon";
import { Search, Linkedin, ExternalLink, Users, Mail } from "lucide-react";

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
  score: number;
  status: string;
  skills: string[];
  created_at: string;
  role: {
    title: string;
    department: string;
  };
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score-desc");

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchQuery, statusFilter, scoreFilter, sortBy]);

  const fetchCandidates = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sourcing_candidates")
      .select(`
        *,
        role:sourcing_roles!inner(title, department)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching candidates:", error);
      setIsLoading(false);
      return;
    }

    setCandidates(data || []);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.current_company?.toLowerCase().includes(query) ||
          c.current_job_title?.toLowerCase().includes(query) ||
          c.role.title.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Score filter
    if (scoreFilter !== "all") {
      if (scoreFilter === "high") {
        filtered = filtered.filter((c) => c.score >= 8);
      } else if (scoreFilter === "medium") {
        filtered = filtered.filter((c) => c.score >= 6 && c.score < 8);
      } else if (scoreFilter === "low") {
        filtered = filtered.filter((c) => c.score < 6);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score-desc":
          return (b.score || 0) - (a.score || 0);
        case "score-asc":
          return (a.score || 0) - (b.score || 0);
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredCandidates(filtered);
  };

  const stats = {
    total: candidates.length,
    qualified: candidates.filter((c) => c.score >= 7).length,
    contacted: candidates.filter((c) => c.status === "contacted" || c.status === "responded").length,
    new: candidates.filter((c) => c.status === "new").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row bg-brand-teal rounded-xl p-4 sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Icon name="users" size={32} className="text-white" />
            Sourced Candidates
          </h1>
          <p className="text-white/80 mt-1">
            AI-sourced candidates from LinkedIn and other platforms
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
                <p className="text-2xl font-bold text-brand-charcoal">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="verify" size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Qualified</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.qualified}</p>
                <p className="text-xs text-brand-charcoal/60">Score ≥ 7.0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="mail" size={20} className="text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Contacted</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.contacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-green shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="user" size={20} className="text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">New</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.new}</p>
                <p className="text-xs text-brand-charcoal/60">Awaiting review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, company, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Score Filter */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (8.0+)</SelectItem>
                <SelectItem value="medium">Medium (6.0-7.9)</SelectItem>
                <SelectItem value="low">Low (&lt;6.0)</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score-desc">Score: High to Low</SelectItem>
                <SelectItem value="score-asc">Score: Low to High</SelectItem>
                <SelectItem value="date-desc">Date: Newest First</SelectItem>
                <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No candidates found</p>
              {searchQuery || statusFilter !== "all" || scoreFilter !== "all" ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Create a role to start sourcing candidates automatically
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCandidates.length} of {candidates.length} candidates
              </p>
            </div>

            {filteredCandidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="hover:shadow-lg transition-all duration-200 border border-border/50 cursor-pointer"
                onClick={() => router.push(`/sourcing/candidates/${candidate.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    {candidate.profile_picture_url ? (
                      <img
                        src={candidate.profile_picture_url}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-lg font-semibold">{candidate.name}</h3>
                            {candidate.score && <ScoreBadge score={candidate.score} />}
                            <CandidateStatusBadge status={candidate.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {candidate.current_job_title} at {candidate.current_company}
                          </p>
                          {candidate.headline && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {candidate.headline}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/sourcing/candidates/${candidate.id}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>

                      {/* Role & Location */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Icon name="briefcase" size={14} />
                          <span>{candidate.role.title}</span>
                        </div>
                        {candidate.location && (
                          <div className="flex items-center gap-1">
                            <Icon name="remote" size={14} />
                            <span>{candidate.location}</span>
                          </div>
                        )}
                        {candidate.experience_years && (
                          <span>{candidate.experience_years}+ years experience</span>
                        )}
                      </div>

                      {/* Skills */}
                      {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {candidate.skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Sourced {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {candidate.linkedin_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(candidate.linkedin_url, "_blank");
                              }}
                            >
                              <Linkedin className="h-4 w-4 mr-1" />
                              LinkedIn
                            </Button>
                          )}
                          {candidate.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${candidate.email}`;
                              }}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
