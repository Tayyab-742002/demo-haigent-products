"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { roleFormSchema, type RoleFormData } from "@/lib/validations/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, X } from "lucide-react";
import { nanoid } from "nanoid";

interface RoleFormProps {
  initialData?: Partial<RoleFormData> & { id?: string; role_id?: string };
  mode?: "create" | "edit";
}

export function RoleForm({ initialData, mode = "create" }: RoleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(
    initialData?.skills ? (initialData.skills as string).split(",").map(s => s.trim()) : []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      department: initialData?.department || "",
      location: initialData?.location || "",
      experience_required: initialData?.experience_required || "",
      skills: initialData?.skills || "",
      description: initialData?.description || "",
      salary_range: initialData?.salary_range || "",
      company_name: initialData?.company_name || "Haigent",
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue("skills", newSkills.join(", "));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(newSkills);
    setValue("skills", newSkills.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // const onSubmit = async (data: RoleFormData) => {
  //   setIsLoading(true);

  //   try {
  //     const supabase = createClient();

  //     // Get current user
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();

  //     if (!user) throw new Error("Not authenticated");

  //     const roleId = mode === "edit" && initialData?.role_id
  //       ? initialData.role_id
  //       : `ROL-${nanoid(10)}`;

  //     const roleData = {
  //       role_id: roleId,
  //       title: data.title,
  //       department: data.department || null,
  //       location: data.location || null,
  //       experience_required: data.experience_required || null,
  //       skills: skills, // Store as JSONB array
  //       description: data.description,
  //       salary_range: data.salary_range || null,
  //       company_name: data.company_name || "Haigent",
  //       organization_id: "00000000-0000-0000-0000-000000000001", // Demo org
  //       created_by: user.id,
  //       status: "active",
  //     };

  //     if (mode === "edit" && initialData?.id) {
  //       // Edit mode: update role
  //       const { error } = await supabase
  //         .from("sourcing_roles")
  //         .update(roleData)
  //         .eq("id", initialData.id);

  //       if (error) throw error;

  //       // Optionally trigger n8n workflow here if needed
  //     } else {
  //       // Create mode: insert role
  //       const { data: insertedData, error } = await supabase
  //         .from("sourcing_roles")
  //         .insert(roleData)
  //         .select("id") // Get the actual DB id
  //         .single();

  //       if (error) throw error;

  //       const dbRoleId = insertedData.id as string;

  //       // Trigger n8n workflow with roleData + dbRoleId
  //       try {
  //         const webhookResponse = await fetch("/api/webhooks/sourcing-webhooks/trigger-search-candidate", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             ...roleData,
  //             db_roleId,
  //           }),
  //         });

  //         console.log("Webhook response status:", webhookResponse.status);
  //       } catch (webhookError) {
  //         console.error("Webhook error:", webhookError);
  //       }
  //     }

  //     router.refresh();
  //   } catch (error) {
  //     console.error("Error saving role:", error);
  //     alert("Error saving role. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const onSubmit = async (data: RoleFormData) => {
  setIsLoading(true);

  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const roleId = mode === "edit" && initialData?.role_id
      ? initialData.role_id
      : `ROL-${nanoid(10)}`;

    const roleData = {
      role_id: roleId,
      title: data.title,
      department: data.department || null,
      location: data.location || null,
      experience_required: data.experience_required || null,
      skills: skills, // Store as JSONB array
      description: data.description,
      salary_range: data.salary_range || null,
      company_name: data.company_name || "Haigent",
      organization_id: "00000000-0000-0000-0000-000000000001", // Demo org
      created_by: user.id,
      status: "active",
    };

    if (mode === "edit" && initialData?.id) {
      // Edit mode
      const { error } = await supabase
        .from("sourcing_roles")
        .update(roleData)
        .eq("id", initialData.id);

      if (error) throw error;

      // Optionally trigger n8n workflow here if needed
    } else {
      // Create mode
      const { data: insertedData, error } = await supabase
        .from("sourcing_roles")
        .insert(roleData)
        .select("id") // Return actual DB id
        .single();

      if (error) throw error;

      // ✅ Define dbRoleId here
      const dbRoleId = insertedData.id as string;

      // Trigger n8n workflow with roleData + dbRoleId
      try {
        const webhookResponse = await fetch(
          "/api/webhooks/sourcing-webhooks/trigger-search-candidate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roleData,
              db_roleId: dbRoleId, // make sure key matches what your backend expects
            }),
          }
        );
        console.log("Webhook response status:", webhookResponse.status);
        
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
      }
    }

    router.replace("/sourcing/roles");
    router.refresh();
  } catch (error) {
    console.error("Error saving role:", error);
    alert("Error saving role. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide details about the role you want to source candidates for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Role Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Senior Full-Stack Developer"
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., Engineering" {...register("department")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Remote, San Francisco, CA" {...register("location")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_required">Experience Required</Label>
              <Input
                id="experience_required"
                placeholder="e.g., 5+ years, 3-5 years"
                {...register("experience_required")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" placeholder="Haigent" {...register("company_name")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary_range">Salary Range</Label>
            <Input id="salary_range" placeholder="e.g., $80k-120k, $150k-200k" {...register("salary_range")} />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>
            Required Skills <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>
            Add the key skills required for this role. Press Enter or click Add to include each skill.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., React, Node.js, TypeScript"
              className="flex-1"
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-brand-gold/10 text-brand-gold border-brand-gold/30 pl-3 pr-1 py-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:bg-brand-gold/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}

          <input type="hidden" {...register("skills")} />
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>
            Job Description <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>
            Provide a detailed description of the role, responsibilities, and what you're looking for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            {...register("description")}
            placeholder="Describe the role, responsibilities, team structure, company culture, and what makes this opportunity exciting..."
            className={`min-h-[200px] ${errors.description ? "border-red-500" : ""}`}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || skills.length === 0} className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "edit" ? "Updating..." : "Creating & Starting Campaign..."}
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              {mode === "edit" ? "Update Role" : "Create Role & Start Sourcing"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
