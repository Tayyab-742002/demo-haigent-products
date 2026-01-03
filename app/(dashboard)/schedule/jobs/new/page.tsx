import Link from "next/link";
import { JobForm } from "@/components/schedule/jobs/JobForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/schedule/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New Job</h2>
          <p className="text-muted-foreground">
            Fill in the details to create a new job posting
          </p>
        </div>
      </div>

      {/* Form */}
      <JobForm mode="create" />
    </div>
  );
}
