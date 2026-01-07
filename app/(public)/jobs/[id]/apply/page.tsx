import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "@/components/schedule/application/ApplicationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("schedule_jobs")
    .select("id, title, department, location")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Apply for {job.title}</h1>
          <p className="text-muted-foreground">
            {job.department && <span>{job.department}</span>}
            {job.department && job.location && <span> · </span>}
            {job.location && <span>{job.location}</span>}
          </p>
        </div>
      </div>

      {/* Application Form */}
      <ApplicationForm jobId={job.id} jobTitle={job.title} />
    </div>
  );
}
