import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Briefcase } from "lucide-react";

export function DashboardPage() {
  const { user, loading } = useAuth();

  // 1) Loading guard (prevents flicker/undefined)
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Loading your dashboard…</h1>
      </div>
    );
  }

  // 2) Not logged in guard
  if (!user) {
    return (
      <div className="p-6 space-y-2">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p className="text-gray-600">You need to be logged in to view the dashboard.</p>
      </div>
    );
  }

  // 3) Safe email fallback
  const displayEmail = user.email || "user";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {displayEmail}! Here's what's happening.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active users in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active staff accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active client accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and management options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            As an admin, you can create and manage users, view system analytics, and configure settings.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
