import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "@/components/schedule/jobs/JobForm";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react";
import { getAgent } from "@/lib/constants/agents";

export const dynamic = "force-dynamic";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

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
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row bg-${primaryColor} rounded-xl p-6 sm:items-center sm:justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <Link href={`/schedule/jobs/${id}`}>
            <Button
              className={`bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all rounded-lg h-10 w-10 p-0 flex items-center justify-center`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Icon name="briefcase" size={32} className="text-white" />
              Edit Job
            </h1>
            <p className="text-white/80 mt-1">
              {job.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/schedule/jobs/${id}`}>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 transition-all"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* Form */}
      <JobForm initialData={initialData} mode="edit" />
    </div>
  );
}
