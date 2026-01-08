"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import { RoleStatusBadge } from "../roles/RoleStatusBadge";
import { Users, Mail, Calendar, TrendingUp } from "lucide-react";

interface ActiveCampaign {
  id: string;
  role_id: string;
  title: string;
  department?: string;
  location?: string;
  status: string;
  total_candidates?: number;
  candidates_qualified?: number;
  emails_sent?: number;
  emails_replied?: number;
  meetings_scheduled?: number;
  created_at: string;
}

interface ActiveCampaignCardProps {
  campaign: ActiveCampaign;
}

export function ActiveCampaignCard({ campaign }: ActiveCampaignCardProps) {
  // Calculate metrics
  const qualificationRate = campaign.total_candidates && campaign.total_candidates > 0
    ? Math.round((campaign.candidates_qualified || 0) / campaign.total_candidates * 100)
    : 0;

  const responseRate = campaign.emails_sent && campaign.emails_sent > 0
    ? Math.round((campaign.emails_replied || 0) / campaign.emails_sent * 100)
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/sourcing/roles/${campaign.role_id}`}>
              <CardTitle className="text-base hover:text-brand-gold transition-colors cursor-pointer">
                {campaign.title}
              </CardTitle>
            </Link>
            {(campaign.department || campaign.location) && (
              <p className="text-xs text-muted-foreground mt-1">
                {campaign.department && <span>{campaign.department}</span>}
                {campaign.department && campaign.location && <span> · </span>}
                {campaign.location && <span>{campaign.location}</span>}
              </p>
            )}
          </div>
          <RoleStatusBadge status={campaign.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-brand-teal" />
            </div>
            <p className="text-lg font-bold text-foreground">{campaign.total_candidates || 0}</p>
            <p className="text-xs text-muted-foreground">Sourced</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-brand-green" />
            </div>
            <p className="text-lg font-bold text-green-600">{campaign.candidates_qualified || 0}</p>
            <p className="text-xs text-muted-foreground">Qualified</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Mail className="h-4 w-4 text-brand-pink" />
            </div>
            <p className="text-lg font-bold text-foreground">{campaign.emails_sent || 0}</p>
            <p className="text-xs text-muted-foreground">Contacted</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-brand-gold" />
            </div>
            <p className="text-lg font-bold text-foreground">{campaign.meetings_scheduled || 0}</p>
            <p className="text-xs text-muted-foreground">Meetings</p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Qualification</span>
              <span className="font-medium">{qualificationRate}%</span>
            </div>
            <Progress value={qualificationRate} className="h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Response</span>
              <span className="font-medium">{responseRate}%</span>
            </div>
            <Progress value={responseRate} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
