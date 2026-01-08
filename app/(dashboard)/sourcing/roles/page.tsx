import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { RoleCard } from "@/components/sourcing/roles/RoleCard";
import { getAgent } from "@/lib/constants/agents";
import { Plus, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = await createClient();
  const agent = getAgent("sourcing");
  const primaryColor = agent?.primaryColor || "brand-gold";
  const secondaryColor = agent?.secondaryColor || "brand-pink";

  const { data: roles, error } = await supabase
    .from("sourcing_roles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching roles:", error);
  }

  const rolesList = roles || [];

  // Calculate stats
  const totalRoles = rolesList.length;
  const activeRoles = rolesList.filter(r => r.status === "active").length;
  const pausedRoles = rolesList.filter(r => r.status === "paused").length;
  const closedRoles = rolesList.filter(r => r.status === "closed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row bg-${primaryColor} rounded-xl p-4 sm:items-center sm:justify-between gap-4`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Icon name="briefcase" size={32} className="text-white" />
            Sourcing Roles
          </h1>
          <p className="text-white/80 mt-1">
            Manage roles and track sourcing campaigns
          </p>
        </div>
        <Link href="/sourcing/roles/new">
          <Button className={`bg-${secondaryColor} hover:brightness-110 text-brand-charcoal transition-all`}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand-gold shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="briefcase" size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Total Roles</p>
                <p className="text-2xl font-bold text-brand-charcoal">{totalRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-green shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="trending-up" size={20} className="text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Active</p>
                <p className="text-2xl font-bold text-brand-charcoal">{activeRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-pink shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="workflow" size={20} className="text-brand-pink" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Paused</p>
                <p className="text-2xl font-bold text-brand-charcoal">{pausedRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-teal shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white">
                <Icon name="checklist" size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-xs text-brand-charcoal/70 font-medium mb-1">Closed</p>
                <p className="text-2xl font-bold text-brand-charcoal">{closedRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Grid or Empty State */}
      {rolesList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No sourcing roles yet
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Create your first sourcing role to start finding and reaching out to
              candidates automatically with AI.
            </p>
            <Link href="/sourcing/roles/new">
              <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Role
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rolesList.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
