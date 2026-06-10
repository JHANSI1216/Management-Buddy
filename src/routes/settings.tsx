import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Admin Settings · CPMS" },
      { name: "description", content: "Profile, notifications, security and appearance preferences." },
    ],
  }),
  component: () => <AppShell><SettingsPage /></AppShell>,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [notif, setNotif] = useState({ critical: true, weekly: true, marketing: false });
  const [mfa, setMfa] = useState(false);
  const [name, setName] = useState(user?.email?.split("@")[0] ?? "Administrator");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="h-6 w-6 text-primary" /> Admin Settings</h1>
        <p className="text-sm text-muted-foreground">Manage profile, notifications, security and appearance.</p>
      </div>

      <Card className="glass">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="gradient-bg text-white text-xl">{name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">{name}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email ?? "Not signed in"}</p>
              <Badge variant="secondary" className="mt-1">Administrator</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value="Campus Administrator" readOnly />
            </div>
          </div>
          <Button className="gradient-bg text-white" onClick={() => toast.success("Profile updated")}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { k: "critical" as const, l: "Critical AI alerts", d: "Equipment failures, safety risks, severe forecasts" },
            { k: "weekly" as const, l: "Weekly digest", d: "Summary report every Monday morning" },
            { k: "marketing" as const, l: "Product updates", d: "New features and platform announcements" },
          ].map((n) => (
            <div key={n.k} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{n.l}</p>
                <p className="text-xs text-muted-foreground">{n.d}</p>
              </div>
              <Switch checked={notif[n.k]} onCheckedChange={(v) => setNotif({ ...notif, [n.k]: v })} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Require a code from your authenticator app on sign in</p>
            </div>
            <Switch checked={mfa} onCheckedChange={setMfa} />
          </div>
          <Separator />
          <Button variant="outline" onClick={() => toast.info("Password reset email queued")}>Change password</Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="text-base flex items-center gap-2">{theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} className="flex-1">
              <Sun className="h-4 w-4" /> Light
            </Button>
            <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} className="flex-1">
              <Moon className="h-4 w-4" /> Dark
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
