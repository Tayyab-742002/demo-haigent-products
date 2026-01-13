"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  Video,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow, startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";

interface Meeting {
  id: string;
  meeting_id: string;
  candidate_id: string;
  role_id: string;
  selected_date: string;
  selected_time: string;
  time_slot: string;
  duration_minutes: number;
  meeting_type: string;
  meeting_link: string;
  zoom_link: string;
  status: string;
  notes: string;
  created_at: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    profile_picture_url: string;
    current_job_title: string;
    current_company: string;
    score: number;
  };
  role: {
    title: string;
    department: string;
  };
}

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-asc");

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [meetings, searchQuery, statusFilter, typeFilter, sortBy]);

  const fetchMeetings = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sourcing_meetings")
      .select(`
        *,
        candidate:sourcing_candidates!inner(
          id,
          name,
          email,
          profile_picture_url,
          current_job_title,
          current_company,
          score
        ),
        role:sourcing_roles!inner(title, department)
      `)
      .order("selected_time", { ascending: true });

    if (error) {
      console.error("Error fetching meetings:", error);
      setIsLoading(false);
      return;
    }

    setMeetings(data || []);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...meetings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.candidate.name.toLowerCase().includes(query) ||
          m.candidate.email?.toLowerCase().includes(query) ||
          m.role.title.toLowerCase().includes(query) ||
          m.meeting_type.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => m.meeting_type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.selected_time).getTime() - new Date(b.selected_time).getTime();
        case "date-desc":
          return new Date(b.selected_time).getTime() - new Date(a.selected_time).getTime();
        default:
          return 0;
      }
    });

    setFilteredMeetings(filtered);
  };

  const stats = {
    total: meetings.length,
    upcoming: meetings.filter((m) => new Date(m.selected_time) > new Date() && m.status !== "cancelled").length,
    completed: meetings.filter((m) => m.status === "completed").length,
    cancelled: meetings.filter((m) => m.status === "cancelled").length,
  };

  const getMeetingsByDate = (date: Date) => {
    return meetings.filter((m) => isSameDay(parseISO(m.selected_date), date));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row bg-brand-green rounded-xl p-4 sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Icon name="calendar" size={32} className="text-white" />
            Meetings & Interviews
          </h1>
          <p className="text-white/80 mt-1">
            Manage and track candidate interview schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-white text-brand-green hover:bg-white/90" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "bg-white text-brand-green hover:bg-white/90" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="calendar" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Total Meetings</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Clock className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <CheckCircle className="h-5 w-5 text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Completed</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-green shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <XCircle className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-brand-charcoal">{stats.cancelled}</p>
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
                  placeholder="Search by candidate, role, or type..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="final">Final Round</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date: Earliest First</SelectItem>
                <SelectItem value="date-desc">Date: Latest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "list" ? (
        /* List View */
        <div className="space-y-3">
          {filteredMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No meetings found</p>
                {searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your filters
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Meetings will be scheduled automatically after candidate responses
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredMeetings.length} of {meetings.length} meetings
                </p>
              </div>

              {filteredMeetings.map((meeting) => {
                const isUpcoming = new Date(meeting.selected_time) > new Date();
                const isPast = new Date(meeting.selected_time) < new Date();

                return (
                  <Card
                    key={meeting.id}
                    className={`hover:shadow-lg transition-all duration-200 border ${
                      isUpcoming && meeting.status === "confirmed"
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Candidate Avatar */}
                        {meeting.candidate.profile_picture_url ? (
                          <img
                            src={meeting.candidate.profile_picture_url}
                            alt={meeting.candidate.name}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {meeting.candidate.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Link
                                  href={`/sourcing/candidates/${meeting.candidate.id}`}
                                  className="font-semibold text-lg hover:underline"
                                >
                                  {meeting.candidate.name}
                                </Link>
                                <Badge variant={meeting.status === "confirmed" ? "default" : "secondary"}>
                                  {getStatusIcon(meeting.status)}
                                  <span className="ml-1">{meeting.status}</span>
                                </Badge>
                                {meeting.candidate.score && (
                                  <Badge variant="outline">Score: {meeting.candidate.score.toFixed(1)}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {meeting.candidate.current_job_title} at {meeting.candidate.current_company}
                              </p>
                            </div>
                          </div>

                          {/* Meeting Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(parseISO(meeting.selected_time), "EEEE, MMMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(parseISO(meeting.selected_time), "h:mm a")} ({meeting.duration_minutes} min)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="briefcase" size={16} />
                              <Link
                                href={`/sourcing/roles/${meeting.role_id}`}
                                className="hover:underline"
                              >
                                {meeting.role.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Video className="h-4 w-4 text-muted-foreground" />
                              <span className="capitalize">{meeting.meeting_type} Interview</span>
                            </div>
                          </div>

                          {/* Notes */}
                          {meeting.notes && (
                            <div className="p-3 bg-muted rounded-lg mb-3">
                              <p className="text-sm">{meeting.notes}</p>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-xs text-muted-foreground">
                              {isUpcoming && meeting.status !== "cancelled" && (
                                <span className="text-green-600 font-medium">
                                  Starts {formatDistanceToNow(parseISO(meeting.selected_time), { addSuffix: true })}
                                </span>
                              )}
                              {isPast && meeting.status === "completed" && (
                                <span>
                                  Completed {formatDistanceToNow(parseISO(meeting.selected_time), { addSuffix: true })}
                                </span>
                              )}
                              {meeting.status === "cancelled" && (
                                <span className="text-red-600">Cancelled</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {meeting.meeting_link && isUpcoming && meeting.status === "confirmed" && (
                                <Button size="sm" asChild>
                                  <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-2" />
                                    Join Meeting
                                  </a>
                                </Button>
                              )}
                              {meeting.zoom_link && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={meeting.zoom_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Zoom
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Meetings on {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getMeetingsByDate(selectedDate).length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No meetings scheduled for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getMeetingsByDate(selectedDate).map((meeting) => (
                    <Card key={meeting.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{meeting.candidate.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {meeting.meeting_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(parseISO(meeting.selected_time), "h:mm a")} - {meeting.duration_minutes} min
                            </p>
                            <p className="text-xs text-muted-foreground">{meeting.role.title}</p>
                          </div>
                          {meeting.meeting_link && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
