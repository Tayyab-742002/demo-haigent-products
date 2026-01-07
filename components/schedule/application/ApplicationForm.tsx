"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  applicationFormSchema,
  type ApplicationFormData,
} from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, FileText, X, CheckCircle, Globe } from "lucide-react";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      timezone: "America/New_York",
      linkedin_url: "",
      portfolio_url: "",
      current_title: "",
      current_company: "",
      experience_years: null,
      cover_letter: "",
    },
  });

  // Auto-detect user's timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Check if detected timezone is in our list
      const isSupported = TIMEZONES.some((tz) => tz.value === detectedTimezone);
      if (isSupported) {
        setValue("timezone", detectedTimezone);
      }
    } catch {
      // Keep default if detection fails
    }
  }, [setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      let resumeUrl = null;
      let resumeFilename = null;
      let resumeText = null;

      // Upload resume if provided
      if (resumeFile) {
        setUploadProgress(10);

        // Extract text from PDF
        if (resumeFile.type === "application/pdf") {
          try {
            const formData = new FormData();
            formData.append("file", resumeFile);

            const extractResponse = await fetch("/api/extract-pdf", {
              method: "POST",
              body: formData,
            });

            if (extractResponse.ok) {
              const extractData = await extractResponse.json();
              resumeText = extractData.text;
            }
          } catch (extractError) {
            console.error("PDF extraction failed:", extractError);
            // Continue without text - not critical for submission
          }
        }

        setUploadProgress(30);

        const fileExt = resumeFile.name.split(".").pop();
        const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile);

        if (uploadError) {
          throw new Error("Failed to upload resume");
        }

        setUploadProgress(60);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);

        resumeUrl = urlData.publicUrl;
        resumeFilename = resumeFile.name;
      }

      setUploadProgress(80);

      // Create candidate record
      const candidateData = {
        job_id: jobId,
        organization_id: "00000000-0000-0000-0000-000000000001",
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        timezone: data.timezone,
        linkedin_url: data.linkedin_url || null,
        portfolio_url: data.portfolio_url || null,
        current_title: data.current_title || null,
        current_company: data.current_company || null,
        experience_years: data.experience_years || null,
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
        resume_text: resumeText,
        cover_letter: data.cover_letter || null,
        status: "applied",
        source: "direct",
      };

      const { data: insertedCandidate, error: insertError } = await supabase
        .from("candidates")
        .insert(candidateData)
        .select("id")
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        if (insertError.code === "23505") {
          throw new Error("You have already applied for this position");
        }
        throw new Error(`Failed to submit application: ${insertError.message}`);
      }

      setUploadProgress(90);

      // Trigger n8n scoring workflow via API route (avoids CORS issues)
      if (insertedCandidate?.id) {
        try {
          const webhookResponse = await fetch("/api/webhooks/schedule-webhooks/trigger-scoring", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidate_id: insertedCandidate.id,
              job_id: jobId,
              agent_id: "schedule",
            }),
          });

          if (!webhookResponse.ok) {
            console.error("Webhook trigger failed:", await webhookResponse.text());
          }
        } catch (webhookError) {
          // Don't fail the submission if webhook fails
          console.error("Failed to trigger scoring workflow:", webhookError);
        }
      }

      setUploadProgress(100);

      // Redirect to success page
      router.push(`/jobs/${jobId}/success`);
    } catch (err) {
      console.error("Application error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
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
                placeholder="john@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register("phone")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Your Timezone
            </Label>
            <Select
              value={watch("timezone")}
              onValueChange={(value) => setValue("timezone", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-detected from your browser. Used to schedule interviews at convenient times.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_title">Current Job Title</Label>
              <Input
                id="current_title"
                placeholder="Software Engineer"
                {...register("current_title")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_company">Current Company</Label>
              <Input
                id="current_company"
                placeholder="Acme Inc."
                {...register("current_company")}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              placeholder="5"
              {...register("experience_years", { valueAsNumber: true })}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                {...register("linkedin_url")}
                disabled={isLoading}
              />
              {errors.linkedin_url && (
                <p className="text-sm text-destructive">
                  {errors.linkedin_url.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio / Website</Label>
              <Input
                id="portfolio_url"
                type="url"
                placeholder="https://johndoe.com"
                {...register("portfolio_url")}
                disabled={isLoading}
              />
              {errors.portfolio_url && (
                <p className="text-sm text-destructive">
                  {errors.portfolio_url.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />

          {!resumeFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-brand-gold hover:bg-brand-gold/5 transition-colors"
              disabled={isLoading}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Click to upload your resume
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF or Word document, max 5MB
              </p>
            </button>
          ) : (
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-gold/10">
                  <FileText className="h-5 w-5 text-brand-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {resumeFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(resumeFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell us why you're interested in this role and what makes you a great fit..."
            rows={5}
            {...register("cover_letter")}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          size="lg"
          className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Submitting..."}
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By submitting this application, you agree to our privacy policy and terms of service.
        </p>
      </div>
    </form>
  );
}
