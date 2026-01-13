import Link from "next/link";
import { RoleForm } from "@/components/sourcing/roles/RoleForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sourcing/roles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Icon name="briefcase" size={28} className="text-brand-gold" />
            Create Sourcing Role
          </h2>
          <p className="text-muted-foreground mt-1">
            Define the role and AI will automatically source, score, and reach out to qualified candidates
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-brand-gold/10 to-brand-pink/10 border-brand-gold/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                AI-Powered Sourcing Campaign
              </p>
              <p className="text-xs text-muted-foreground">
                Once you create this role, our AI will automatically:
                <span className="ml-1">1) Search LinkedIn for matching candidates</span> •
                <span className="ml-1">2) Score each candidate based on fit</span> •
                <span className="ml-1">3) Send personalized outreach emails</span> •
                <span className="ml-1">4) Track responses and schedule meetings</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <RoleForm mode="create" />
    </div>
  );
}
