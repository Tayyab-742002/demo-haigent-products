"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Mail,
  Globe,
  Clock,
  Bell,
  Palette,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Demo settings state
  const [settings, setSettings] = useState({
    companyName: "Haigent Demo",
    companyWebsite: "https://haigent.ai",
    supportEmail: "careers@haigent.ai",
    timezone: "America/New_York",
    defaultInterviewDuration: "45",
    emailNotifications: true,
    autoScoreDefault: true,
    defaultScoreThreshold: "70",
    brandColor: "#D4AF37",
    emailFooter: "Thank you for your interest in joining our team!",
  });

  const handleSave = async () => {
    setIsLoading(true);
    setSaved(false);

    // Simulate save - in real app this would save to Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setSaved(true);

    // Reset saved indicator after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">
            Configure your Schedule Haigent preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-charcoal"
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

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-gold" />
            Company Information
          </CardTitle>
          <CardDescription>
            Basic information about your company for job postings and emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                type="url"
                value={settings.companyWebsite}
                onChange={(e) =>
                  setSettings({ ...settings, companyWebsite: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Careers Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Email address shown to candidates for support
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-teal" />
            Scheduling Defaults
          </CardTitle>
          <CardDescription>
            Default settings for interview scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) =>
                  setSettings({ ...settings, timezone: value })
                }
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
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Default Interview Duration</Label>
              <Select
                value={settings.defaultInterviewDuration}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultInterviewDuration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-green" />
            AI Scoring Defaults
          </CardTitle>
          <CardDescription>
            Default AI settings for new job postings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Auto-score candidates by default</p>
              <p className="text-sm text-muted-foreground">
                New jobs will have auto-scoring enabled
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoScoreDefault}
                onChange={(e) =>
                  setSettings({ ...settings, autoScoreDefault: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultThreshold">
              Default Score Threshold: {settings.defaultScoreThreshold}%
            </Label>
            <input
              type="range"
              id="defaultThreshold"
              min="0"
              max="100"
              value={settings.defaultScoreThreshold}
              onChange={(e) =>
                setSettings({ ...settings, defaultScoreThreshold: e.target.value })
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-gold"
            />
            <p className="text-xs text-muted-foreground">
              Default minimum score for new jobs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-pink" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Email notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive emails for new applications and scheduled interviews
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Email Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-gold" />
            Email Templates
          </CardTitle>
          <CardDescription>
            Customize email content sent to candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailFooter">Email Footer Message</Label>
            <Textarea
              id="emailFooter"
              value={settings.emailFooter}
              onChange={(e) =>
                setSettings({ ...settings, emailFooter: e.target.value })
              }
              rows={3}
              placeholder="Message shown at the bottom of all candidate emails"
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-gold" />
            Branding
          </CardTitle>
          <CardDescription>
            Customize the appearance of your job pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandColor">Primary Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="brandColor"
                value={settings.brandColor}
                onChange={(e) =>
                  setSettings({ ...settings, brandColor: e.target.value })
                }
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <Input
                value={settings.brandColor}
                onChange={(e) =>
                  setSettings({ ...settings, brandColor: e.target.value })
                }
                className="flex-1 font-mono"
                placeholder="#D4AF37"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used for buttons and accents on public job pages
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Demo Mode</h4>
              <p className="text-sm text-muted-foreground">
                Settings are stored locally in this demo. In production, these would be
                saved to your organization&apos;s settings in the database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
