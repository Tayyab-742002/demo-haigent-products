"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleStatusBadge } from "./RoleStatusBadge";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Pencil,
  Users,
  Mail,
  Calendar,
  Play,
  Pause,
  XCircle,
} from "lucide-react";

interface Role {
  id: string;
  role_id: string;
  title: string;
  department?: string;
  location?: string;
  status: string;
  total_candidates?: number;
  candidates_scored?: number;
  candidates_qualified?: number;
  emails_sent?: number;
  emails_replied?: number;
  meetings_scheduled?: number;
  created_at: string;
  skills?: any;
}

interface RoleCardProps {
  role: Role;
}

export function RoleCard({ role }: RoleCardProps) {
  // Calculate response rate
  const responseRate = role.emails_sent && role.emails_sent > 0
    ? Math.round((role.emails_replied || 0) / role.emails_sent * 100)
    : 0;

  // Calculate qualification rate
  const qualificationRate = role.total_candidates && role.total_candidates > 0
    ? Math.round((role.candidates_qualified || 0) / role.total_candidates * 100)
    : 0;

  // Parse skills array
  const skills = Array.isArray(role.skills) ? role.skills : [];

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-border/50 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/sourcing/roles/${role.role_id}`}>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-gold transition-colors cursor-pointer mb-1">
                {role.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {role.department && (
                <>
                  <Icon name="briefcase" size={14} />
                  <span>{role.department}</span>
                </>
              )}
              {role.department && role.location && <span>·</span>}
              {role.location && (
                <>
                  <Icon name="remote" size={14} />
                  <span>{role.location}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RoleStatusBadge status={role.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/sourcing/roles/${role.role_id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/sourcing/roles/${role.role_id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Role
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {role.status === "active" && (
                  <DropdownMenuItem>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Campaign
                  </DropdownMenuItem>
                )}
                {role.status === "paused" && (
                  <DropdownMenuItem>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Campaign
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  Close Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.slice(0, 5).map((skill: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 text-xs"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Link href={`/sourcing/candidates?role=${role.role_id}`}>
            <div className="text-center p-3 bg-brand-teal/10 rounded-lg hover:bg-brand-teal/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-brand-teal" />
                <span className="text-2xl font-bold text-brand-teal">
                  {role.total_candidates || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Candidates</p>
            </div>
          </Link>

          <Link href={`/sourcing/outreach?role=${role.role_id}`}>
            <div className="text-center p-3 bg-brand-pink/10 rounded-lg hover:bg-brand-pink/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Mail className="h-4 w-4 text-brand-pink" />
                <span className="text-2xl font-bold text-brand-pink">
                  {role.emails_sent || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Emails Sent</p>
            </div>
          </Link>

          <Link href={`/sourcing/meetings?role=${role.role_id}`}>
            <div className="text-center p-3 bg-brand-green/10 rounded-lg hover:bg-brand-green/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-brand-green" />
                <span className="text-2xl font-bold text-brand-green">
                  {role.meetings_scheduled || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Meetings</p>
            </div>
          </Link>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-3">
          {/* Qualification Rate */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Qualification Rate</span>
              <span className="font-medium">
                {role.candidates_qualified || 0} / {role.total_candidates || 0} ({qualificationRate}%)
              </span>
            </div>
            <Progress value={qualificationRate} className="h-2" />
          </div>

          {/* Response Rate */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Response Rate</span>
              <span className="font-medium">
                {role.emails_replied || 0} / {role.emails_sent || 0} ({responseRate}%)
              </span>
            </div>
            <Progress value={responseRate} className="h-2" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Created {new Date(role.created_at).toLocaleDateString()}
          </span>
          <Link href={`/sourcing/roles/${role.role_id}`}>
            <Button variant="outline" size="sm" className="text-brand-gold border-brand-gold/30 hover:bg-brand-gold/10">
              View Campaign
              <Icon name="arrow-right" size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
