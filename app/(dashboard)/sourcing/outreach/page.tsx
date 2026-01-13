"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutreachStatusBadge } from "@/components/sourcing/outreach/OutreachStatusBadge";
import { Icon } from "@/components/ui/icon";
import { Search, Eye, MousePointerClick, Reply, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Outreach {
  id: string;
  outreach_id: string;
  candidate_id: string;
  role_id: string;
  email_subject: string;
  email_body: string;
  status: string;
  sent_at: string;
  opened_at: string;
  clicked_at: string;
  replied_at: string;
  reply_text: string;
  reply_sentiment: string;
  created_at: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    profile_picture_url: string;
    current_job_title: string;
    current_company: string;
  };
  role: {
    title: string;
    department: string;
  };
}

export default function OutreachPage() {
  const router = useRouter();
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [filteredOutreach, setFilteredOutreach] = useState<Outreach[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  useEffect(() => {
    fetchOutreach();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [outreach, searchQuery, statusFilter, sentimentFilter, sortBy]);

  const fetchOutreach = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sourcing_outreach")
      .select(`
        *,
        candidate:sourcing_candidates!inner(
          id,
          name,
          email,
          profile_picture_url,
          current_job_title,
          current_company
        ),
        role:sourcing_roles!inner(title, department)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching outreach:", error);
      setIsLoading(false);
      return;
    }

    setOutreach(data || []);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...outreach];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.candidate.name.toLowerCase().includes(query) ||
          o.candidate.email?.toLowerCase().includes(query) ||
          o.email_subject.toLowerCase().includes(query) ||
          o.role.title.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "opened") {
        filtered = filtered.filter((o) => o.opened_at !== null);
      } else if (statusFilter === "replied") {
        filtered = filtered.filter((o) => o.replied_at !== null);
      } else if (statusFilter === "clicked") {
        filtered = filtered.filter((o) => o.clicked_at !== null);
      } else {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
    }

    // Sentiment filter
    if (sentimentFilter !== "all") {
      filtered = filtered.filter((o) => o.reply_sentiment === sentimentFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime();
        case "date-asc":
          return new Date(a.sent_at || a.created_at).getTime() - new Date(b.sent_at || b.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredOutreach(filtered);
  };

  const stats = {
    total: outreach.length,
    sent: outreach.filter((o) => o.sent_at !== null).length,
    opened: outreach.filter((o) => o.opened_at !== null).length,
    replied: outreach.filter((o) => o.replied_at !== null).length,
    openRate: outreach.filter((o) => o.sent_at).length > 0
      ? ((outreach.filter((o) => o.opened_at).length / outreach.filter((o) => o.sent_at).length) * 100).toFixed(1)
      : 0,
    replyRate: outreach.filter((o) => o.sent_at).length > 0
      ? ((outreach.filter((o) => o.replied_at).length / outreach.filter((o) => o.sent_at).length) * 100).toFixed(1)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading outreach campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row bg-brand-pink rounded-xl p-4 sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Icon name="mail" size={32} className="text-white" />
            Outreach Campaigns
          </h1>
          <p className="text-white/80 mt-1">
            Track email outreach performance and candidate responses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="mail" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Total Campaigns</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.total}</p>
                <p className="text-xs text-brand-charcoal/60">{stats.sent} sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Eye className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Opened</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.opened}</p>
                <p className="text-xs text-brand-charcoal/60">{stats.openRate}% open rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Reply className="h-5 w-5 text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Replied</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.replied}</p>
                <p className="text-xs text-brand-charcoal/60">{stats.replyRate}% reply rate</p>
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
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Avg. Performance</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.openRate}%</p>
                <p className="text-xs text-brand-charcoal/60">Combined rate</p>
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
                  placeholder="Search by candidate, subject, or role..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="clicked">Clicked</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>

            {/* Sentiment Filter */}
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date: Newest First</SelectItem>
                <SelectItem value="date-asc">Date: Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {filteredOutreach.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="mail" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No outreach campaigns found</p>
              {searchQuery || statusFilter !== "all" || sentimentFilter !== "all" ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Outreach emails will be sent automatically to qualified candidates
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Showing {filteredOutreach.length} of {outreach.length} campaigns
              </p>
            </div>

            {filteredOutreach.map((email) => (
              <Card
                key={email.id}
                className="hover:shadow-lg transition-all duration-200 border border-border/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Candidate Avatar */}
                    {email.candidate.profile_picture_url ? (
                      <img
                        src={email.candidate.profile_picture_url}
                        alt={email.candidate.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {email.candidate.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link
                              href={`/sourcing/candidates/${email.candidate.id}`}
                              className="font-semibold hover:underline"
                            >
                              {email.candidate.name}
                            </Link>
                            <OutreachStatusBadge status={email.status} />
                            {email.reply_sentiment && (
                              <Badge
                                variant={
                                  email.reply_sentiment === "positive"
                                    ? "default"
                                    : email.reply_sentiment === "negative"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {email.reply_sentiment}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {email.candidate.current_job_title} at {email.candidate.current_company}
                          </p>
                        </div>
                      </div>

                      {/* Email Subject */}
                      <div className="mb-3">
                        <p className="font-medium text-sm mb-1">Subject: {email.email_subject}</p>
                        <Link
                          href={`/sourcing/roles/${email.role_id}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Role: {email.role.title}
                        </Link>
                      </div>

                      {/* Email Preview */}
                      <div className="p-3 bg-muted rounded-lg mb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.email_body}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-6 text-xs">
                        {email.sent_at && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-muted-foreground">
                              Sent {formatDistanceToNow(new Date(email.sent_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        {email.opened_at && (
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-600">
                              Opened {formatDistanceToNow(new Date(email.opened_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        {email.clicked_at && (
                          <div className="flex items-center gap-1.5">
                            <MousePointerClick className="h-3.5 w-3.5 text-purple-600" />
                            <span className="text-purple-600">
                              Clicked {formatDistanceToNow(new Date(email.clicked_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        {email.replied_at && (
                          <div className="flex items-center gap-1.5">
                            <Reply className="h-3.5 w-3.5 text-orange-600" />
                            <span className="text-orange-600 font-medium">
                              Replied {formatDistanceToNow(new Date(email.replied_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Reply Text */}
                      {email.reply_text && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            Reply:
                          </p>
                          <p className="text-sm line-clamp-2">{email.reply_text}</p>
                        </div>
                      )}
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
