import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Building,
  Wifi,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PublicJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicJobPage({ params }: PublicJobPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("schedule_jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !job) {
    notFound();
  }

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    if (min) return `From ${formatter.format(min)}`;
    if (max) return `Up to ${formatter.format(max)}`;
    return null;
  };

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  const employmentLabels: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
  };

  const remoteLabels: Record<string, string> = {
    onsite: "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {job.department && (
                  <span className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    {job.department}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {employmentLabels[job.employment_type] || job.employment_type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="h-4 w-4" />
                  {remoteLabels[job.remote_policy] || job.remote_policy}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {salary && (
                  <Badge variant="secondary" className="gap-1.5">
                    <DollarSign className="h-3 w-3" />
                    {salary}
                  </Badge>
                )}
                {job.deadline && (
                  <Badge variant="outline" className="gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Apply by {new Date(job.deadline).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>

            <Link href={`/jobs/${id}/apply`}>
              <Button
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal font-semibold w-full sm:w-auto"
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <div className="grid gap-6">
        {job.description && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                About This Role
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </CardContent>
          </Card>
        )}

        {job.responsibilities && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Responsibilities
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.responsibilities}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Requirements
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {job.requirements}
            </p>
          </CardContent>
        </Card>

        {job.nice_to_have && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Nice to Have
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.nice_to_have}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Apply CTA */}
      <Card className="bg-brand-charcoal text-white border-0">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Ready to apply?</h3>
              <p className="text-white/70 mt-1">
                Submit your application and we&apos;ll get back to you soon.
              </p>
            </div>
            <Link href={`/jobs/${id}/apply`}>
              <Button
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal font-semibold"
              >
                Apply for This Position
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Posted Date */}
      <p className="text-center text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5 inline mr-1" />
        Posted on {new Date(job.published_at || job.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
