"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Clock, Zap, Calendar } from "lucide-react";

const interviewerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  title: z.string().optional(),
  department: z.string().optional(),
  cal_username: z.string().optional(),
  timezone: z.string().default("America/New_York"),
  max_interviews_per_day: z.number().min(1).max(10).default(4),
  available_start_time: z.string().default("09:00"),
  available_end_time: z.string().default("17:00"),
});

type InterviewerFormData = z.infer<typeof interviewerSchema>;

export default function NewInterviewerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterviewerFormData>({
    resolver: zodResolver(interviewerSchema),
    defaultValues: {
      name: "",
      email: "",
      title: "",
      department: "",
      cal_username: "",
      timezone: "America/New_York",
      max_interviews_per_day: 4,
      available_start_time: "09:00",
      available_end_time: "17:00",
    },
  });

  const onSubmit = async (data: InterviewerFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const interviewerData = {
        name: data.name,
        email: data.email,
        title: data.title || null,
        department: data.department || null,
        cal_username: data.cal_username || null,
        timezone: data.timezone,
        max_interviews_per_day: data.max_interviews_per_day,
        organization_id: "00000000-0000-0000-0000-000000000001", // Demo org
        is_active: true,
        available_start_time: data.available_start_time,
        available_end_time: data.available_end_time,
      };

      const { error } = await supabase.from("interviewers").insert(interviewerData);

      if (error) throw error;

      router.push("/schedule/interviewers");
      router.refresh();
    } catch (error) {
      console.error("Error creating interviewer:", error);
      alert("Failed to create interviewer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/schedule/interviewers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Add Interviewer</h2>
          <p className="text-muted-foreground">
            Add a team member who will conduct interviews
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interviewer Details</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-gold" />
              Cal.com Integration
            </CardTitle>
            <CardDescription>
              Connect to Cal.com for automatic meeting scheduling and calendar sync
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cal_username">Cal.com Username</Label>
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
                Enter the Cal.com username for this interviewer. This enables automatic scheduling via Cal.com with video call links.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-teal" />
              Availability Settings
            </CardTitle>
            <CardDescription>
              Configure when this interviewer is available for auto-scheduled interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={watch("timezone")}
                onValueChange={(value) => setValue("timezone", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available_start_time">Available From</Label>
                <Input
                  id="available_start_time"
                  type="time"
                  {...register("available_start_time")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_end_time">Available Until</Label>
                <Input
                  id="available_end_time"
                  type="time"
                  {...register("available_end_time")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_interviews_per_day">
                Max Interviews Per Day: {watch("max_interviews_per_day")}
              </Label>
              <input
                type="range"
                id="max_interviews_per_day"
                min="1"
                max="10"
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-gold"
                {...register("max_interviews_per_day", { valueAsNumber: true })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Limit interviews to prevent overbooking
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-scheduling info */}
        <Card className="border-brand-gold/30 bg-brand-gold/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">AI-Powered Auto-Scheduling via Cal.com</p>
                <p className="text-xs text-muted-foreground">
                  Qualified candidates will be automatically scheduled via Cal.com during available hours.
                  The system finds optimal time slots considering both parties' timezones and sends calendar invites with video call links automatically.
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
            className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Add Interviewer
          </Button>
        </div>
      </form>
    </div>
  );
}
