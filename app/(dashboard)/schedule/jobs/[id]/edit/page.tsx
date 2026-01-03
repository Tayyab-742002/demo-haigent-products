import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "@/components/schedule/jobs/JobForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch job details
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  // Map job data to form data structure
  const initialData = {
    id: job.id,
    title: job.title,
    department: job.department || "",
    location: job.location || "",
    employment_type: job.employment_type || "full-time",
    remote_policy: job.remote_policy || "hybrid",
    salary_min: job.salary_min || undefined,
    salary_max: job.salary_max || undefined,
    salary_currency: job.salary_currency || "USD",
    description: job.description || "",
    requirements: job.requirements || "",
    responsibilities: job.responsibilities || "",
    nice_to_have: job.nice_to_have || "",
    deadline: job.deadline ? job.deadline.split("T")[0] : "",
    auto_score: job.auto_score ?? true,
    score_threshold: job.score_threshold || 70,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/schedule/jobs/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Job</h2>
          <p className="text-muted-foreground">{job.title}</p>
        </div>
      </div>

      {/* Form */}
      <JobForm initialData={initialData} mode="edit" />
    </div>
  );
}
