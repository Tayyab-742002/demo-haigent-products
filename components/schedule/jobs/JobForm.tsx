"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { jobFormSchema, type JobFormData } from "@/lib/validations/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Send } from "lucide-react";

interface JobFormProps {
  initialData?: Partial<JobFormData> & { id?: string };
  mode?: "create" | "edit";
}

export function JobForm({ initialData, mode = "create" }: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [publishAfterSave, setPublishAfterSave] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      department: initialData?.department || "",
      location: initialData?.location || "",
      employment_type: initialData?.employment_type || "full-time",
      remote_policy: initialData?.remote_policy || "hybrid",
      salary_min: initialData?.salary_min,
      salary_max: initialData?.salary_max,
      salary_currency: initialData?.salary_currency || "USD",
      description: initialData?.description || "",
      requirements: initialData?.requirements || "",
      responsibilities: initialData?.responsibilities || "",
      nice_to_have: initialData?.nice_to_have || "",
      deadline: initialData?.deadline || "",
      auto_score: initialData?.auto_score ?? true,
      score_threshold: initialData?.score_threshold || 70,
    },
  });

  const onSubmit = async (data: JobFormData, shouldPublish: boolean = false) => {
    setIsLoading(true);
    setPublishAfterSave(shouldPublish);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const jobData = {
        ...data,
        organization_id: "00000000-0000-0000-0000-000000000001", // Demo org
        created_by: user.id,
        status: shouldPublish ? "active" : "draft",
        published_at: shouldPublish ? new Date().toISOString() : null,
      };

      if (mode === "edit" && initialData?.id) {
        const { error } = await supabase
          .from("schedule_jobs")
          .update(jobData)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("schedule_jobs").insert(jobData);

        if (error) throw error;
      }

      router.push("/schedule/jobs");
      router.refresh();
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Senior Software Engineer"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g. Engineering"
                {...register("department")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. New York, NY"
                {...register("location")}
              />
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                defaultValue={watch("employment_type")}
                onValueChange={(value) =>
                  setValue("employment_type", value as JobFormData["employment_type"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Remote Policy</Label>
              <Select
                defaultValue={watch("remote_policy")}
                onValueChange={(value) =>
                  setValue("remote_policy", value as JobFormData["remote_policy"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Salary Min</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="e.g. 80000"
                {...register("salary_min", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Salary Max</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="e.g. 120000"
                {...register("salary_max", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role and what makes it exciting..."
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">
              Requirements <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="requirements"
              placeholder="List the skills, experience, and qualifications required..."
              rows={5}
              {...register("requirements")}
            />
            {errors.requirements && (
              <p className="text-sm text-destructive">{errors.requirements.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              These requirements will be used by AI to score candidates
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea
              id="responsibilities"
              placeholder="List the key responsibilities for this role..."
              rows={4}
              {...register("responsibilities")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nice_to_have">Nice to Have</Label>
            <Textarea
              id="nice_to_have"
              placeholder="Optional skills or experience that would be a plus..."
              rows={3}
              {...register("nice_to_have")}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>AI Scoring Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Auto-score candidates</p>
              <p className="text-sm text-muted-foreground">
                Automatically score candidates when they apply
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register("auto_score")}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score_threshold">
              Minimum Score Threshold: {watch("score_threshold")}%
            </Label>
            <input
              type="range"
              id="score_threshold"
              min="0"
              max="100"
              className="w-full"
              {...register("score_threshold", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Candidates below this score will be marked for review
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading && !publishAfterSave ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={handleSubmit((data) => onSubmit(data, true))}
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal"
          disabled={isLoading}
        >
          {isLoading && publishAfterSave ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Save & Publish
        </Button>
      </div>
    </form>
  );
}
