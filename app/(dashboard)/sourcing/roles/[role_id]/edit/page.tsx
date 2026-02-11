import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleForm } from "@/components/sourcing/roles/RoleForm";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface EditRolePageProps {
  params: Promise<{ role_id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { role_id } = await params;
  const supabase = await createClient();

  const { data: role, error } = await supabase
    .from("sourcing_roles")
    .select("*")
    .eq("role_id", role_id)
    .single();

  if (error || !role) {
    notFound();
  }

  const initialData = {
    id: role.id,
    role_id: role.role_id,
    title: role.title,
    department: role.department || "",
    location: role.location || "",
    experience_required: role.experience_required || "",
    skills: Array.isArray(role.skills) ? role.skills.join(", ") : "",
    description: role.description || "",
    salary_range: role.salary_range || "",
    company_name: role.company_name || "Haigent",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sourcing/roles/${role_id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Icon name="briefcase" size={28} className="text-brand-gold" />
            Edit Sourcing Role
          </h2>
          <p className="text-muted-foreground mt-1">
            {role.title}
          </p>
        </div>
      </div>

      {/* Form */}
      <RoleForm initialData={initialData} mode="edit" />
    </div>
  );
}
