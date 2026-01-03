import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-brand-green" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for applying for the <strong>{job.title}</strong> position.
            We&apos;ve received your application and will review it shortly.
          </p>

          {/* What's Next */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-teal" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Our AI will analyze your application against the job requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>If shortlisted, you&apos;ll receive an email to schedule an interview</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Book a time that works for you using our scheduling link</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link href={`/jobs/${id}`}>
            <Button variant="outline" className="gap-2">
              Back to Job Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Questions? Contact us at{" "}
        <a href="mailto:careers@haigent.ai" className="text-brand-teal hover:underline">
          careers@haigent.ai
        </a>
      </p>
    </div>
  );
}
