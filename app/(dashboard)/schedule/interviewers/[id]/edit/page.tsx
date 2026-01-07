"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Loader2,
  Save,
  Zap,
  Calendar,
  Key,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { use } from "react";
import { Icon } from "@/components/ui/icon";
import { getAgent } from "@/lib/constants/agents";

const interviewerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  title: z.string().optional(),
  department: z.string().optional(),
  cal_username: z.string().optional(),
  cal_api_key: z.string().optional(),
  cal_event_type_id: z.number().optional(),
  cal_event_type_slug: z.string().optional(),
  is_active: z.boolean(),
});

type InterviewerFormData = z.infer<typeof interviewerSchema>;

interface EditInterviewerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditInterviewerPage({ params }: EditInterviewerPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InterviewerFormData>({
    resolver: zodResolver(interviewerSchema),
    defaultValues: {
      name: "",
      email: "",
      title: "",
      department: "",
      cal_username: "",
      cal_api_key: "",
      cal_event_type_id: undefined,
      cal_event_type_slug: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  // Fetch interviewer data
  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("schedule_interviewers")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          reset({
            name: data.name || "",
            email: data.email || "",
            title: data.title || "",
            department: data.department || "",
            cal_username: data.cal_username || "",
            cal_api_key: data.cal_api_key || "",
            cal_event_type_id: data.cal_event_type_id || undefined,
            cal_event_type_slug: data.cal_event_type_slug || "",
            is_active: data.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Error fetching interviewer:", err);
        setError("Failed to load interviewer data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchInterviewer();
  }, [id, reset]);

  const onSubmit = async (data: InterviewerFormData) => {
    setIsLoading(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();

      const updateData = {
        name: data.name,
        email: data.email,
        title: data.title || null,
        department: data.department || null,
        cal_username: data.cal_username || null,
        cal_api_key: data.cal_api_key || null,
        cal_event_type_id: data.cal_event_type_id || null,
        cal_event_type_slug: data.cal_event_type_slug || null,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("schedule_interviewers")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error updating interviewer:", err);
      setError("Failed to update interviewer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if interviewer has any scheduled interviews
      const { data: interviews } = await supabase
        .from("schedule_interviews")
        .select("id")
        .eq("interviewer_id", id)
        .eq("status", "scheduled")
        .limit(1);

      if (interviews && interviews.length > 0) {
        setError("Cannot delete interviewer with scheduled interviews. Please reassign or cancel them first.");
        setIsDeleting(false);
        return;
      }

      const { error } = await supabase
        .from("schedule_interviewers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.push("/schedule/interviewers");
      router.refresh();
    } catch (err) {
      console.error("Error deleting interviewer:", err);
      setError("Failed to delete interviewer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className={`bg-${primaryColor} rounded-xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <Link href="/schedule/interviewers">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Interviewer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the interviewer
                  and remove them from all future scheduling.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-4">
          <Icon name="user-settings" size={48} className="text-white" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Edit Interviewer</h1>
            <p className="text-white/80 text-lg mt-1">
              Update interviewer details and Cal.com integration
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Card */}
        <Card className={`${isActive ? "border-brand-green/30 bg-brand-green/5" : "border-muted bg-muted/30"} shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-brand-green/20" : "bg-muted"}`}>
                  {isActive ? (
                    <CheckCircle className="h-5 w-5 text-brand-green" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isActive ? "Active Interviewer" : "Inactive Interviewer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isActive
                      ? "This interviewer is available for scheduling"
                      : "This interviewer will not be assigned new interviews"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Interviewer Details */}
        <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="user" size={20} className="text-brand-teal" />
              Interviewer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="Engineering Manager"
                  {...register("title")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Engineering"
                  {...register("department")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cal.com Integration */}
        <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="network" size={20} className="text-brand-gold" />
              Cal.com Integration
            </CardTitle>
            <CardDescription>
              Connect the interviewer&apos;s Cal.com account for automatic meeting scheduling.
              Each interviewer uses their own Cal.com to manage availability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cal_username">
                Cal.com Username <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">cal.com/</span>
                <Input
                  id="cal_username"
                  placeholder="john-smith"
                  {...register("cal_username")}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The Cal.com username (found in your Cal.com profile URL)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cal_api_key" className="flex items-center gap-2">
                <Key className="h-3.5 w-3.5" />
                Cal.com API Key <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="cal_api_key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="cal_live_xxxxxxxxxxxxxxxx"
                  {...register("cal_api_key")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate at{" "}
                <a
                  href="https://app.cal.com/settings/developer/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold hover:underline"
                >
                  Cal.com Settings → Developer → API Keys
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cal_event_type_id" className="flex items-center gap-2">
                  Event Type ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cal_event_type_id"
                  type="number"
                  placeholder="1234567"
                  {...register("cal_event_type_id", { valueAsNumber: true })}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Numeric ID from the event type URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cal_event_type_slug" className="flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Event Type Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cal_event_type_slug"
                  placeholder="interview-45min"
                  {...register("cal_event_type_slug")}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  The slug from your event type URL (e.g., &quot;interview-45min&quot;)
                </p>
              </div>
            </div>

            {/* Help section */}
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">How to find these values:</p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Go to <strong>Cal.com → Event Types</strong></li>
                <li>Click on your interview event type (or create one)</li>
                <li>The URL will look like: <code className="bg-muted px-1 rounded">cal.com/event-types/1234567</code></li>
                <li><strong>Event Type ID</strong> is the number (e.g., 1234567)</li>
                <li><strong>Event Type Slug</strong> is from your booking URL: <code className="bg-muted px-1 rounded">cal.com/username/<strong>interview-45min</strong></code></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Auto-scheduling info */}
        <Card className="border-brand-gold/30 bg-brand-gold/5 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">AI-Powered Auto-Scheduling via Cal.com</p>
                <p className="text-xs text-muted-foreground">
                  Qualified candidates will be automatically scheduled based on the interviewer&apos;s Cal.com availability.
                  Timezone and availability are managed directly in Cal.com - no need to configure them here.
                </p>
              </div>
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
            className={`bg-${secondaryColor} hover:brightness-110 text-brand-charcoal`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
