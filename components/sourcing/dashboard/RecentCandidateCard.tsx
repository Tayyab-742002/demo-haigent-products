"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "../candidates/ScoreBadge";
import { CandidateStatusBadge } from "../candidates/CandidateStatusBadge";
import { Icon } from "@/components/ui/icon";
import { Briefcase, MapPin, ExternalLink } from "lucide-react";

interface RecentCandidate {
  id: string;
  candidate_id: string;
  name: string;
  email?: string;
  profile_picture_url?: string;
  current_job_title?: string;
  current_company?: string;
  location?: string;
  linkedin_url?: string;
  score?: number;
  status: string;
  role_id?: string;
  created_at: string;
}

interface RecentCandidateCardProps {
  candidate: RecentCandidate;
  roleTitle?: string;
}

export function RecentCandidateCard({ candidate, roleTitle }: RecentCandidateCardProps) {
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/sourcing/candidates/${candidate.candidate_id}`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={candidate.profile_picture_url} alt={candidate.name} />
              <AvatarFallback className="bg-brand-gold/20 text-brand-gold font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-foreground hover:text-brand-gold transition-colors truncate">
                  {candidate.name}
                </h4>
                {candidate.score !== null && candidate.score !== undefined && (
                  <ScoreBadge score={candidate.score} size="sm" />
                )}
              </div>

              {/* Job Title */}
              {candidate.current_job_title && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {candidate.current_job_title}
                    {candidate.current_company && ` @ ${candidate.current_company}`}
                  </span>
                </div>
              )}

              {/* Location */}
              {candidate.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{candidate.location}</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CandidateStatusBadge status={candidate.status} className="text-xs" />
                  {roleTitle && (
                    <Badge variant="outline" className="text-xs bg-brand-gold/10 text-brand-gold border-brand-gold/20">
                      {roleTitle}
                    </Badge>
                  )}
                </div>
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-brand-teal hover:text-brand-teal/80"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
