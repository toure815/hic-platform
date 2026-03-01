import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, Users, TrendingUp, AlertCircle, Clock, CheckCircle2, FileCheck, Send, Search } from "lucide-react";
import { NotificationList } from "../components/NotificationList";
import { useEffect, useState } from "react";
import { useBackend } from "@/hooks/useBackend";
import type { DocumentWithUser } from "~backend/onboarding/list_all_documents";
import type { OnboardingStatusResponse } from "~backend/onboarding/types";
import type { DashboardStats, ClientPipelineStats, AllProvidersResponse } from "~backend/dashboard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { OnboardingStatusCard } from "../components/OnboardingStatusCard";
import { Badge } from "@/components/ui/badge";

export function DashboardPage() {
  const { user, loading } = useAuth();
  const backend = useBackend();
  const [documents, setDocuments] = useState<DocumentWithUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatusResponse | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [pipelineStats, setPipelineStats] = useState<ClientPipelineStats | null>(null);
  const [providersData, setProvidersData] = useState<AllProvidersResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    } else if (user?.role === "client") {
      loadClientData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoadingData(true);
      const [stats, pipeline, providers] = await Promise.all([
        backend.dashboard.getStats(),
        backend.dashboard.getPipeline(),
        backend.dashboard.listProviders(),
      ]);
      setDashboardStats(stats);
      setPipelineStats(pipeline);
      setProvidersData(providers);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadClientData = async () => {
    try {
      setLoadingData(true);
      const response = await backend.onboarding.getStatus();
      setOnboardingStatus(response.status);
    } catch (error) {
      console.error("Failed to load client data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      not_started: { variant: "outline", label: "Not Started" },
      in_progress: { variant: "default", label: "In Progress" },
      pending_review: { variant: "secondary", label: "Pending Review" },
      completed: { variant: "default", label: "Completed" },
      archived: { variant: "secondary", label: "Archived" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredProviders = providersData?.providers.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Loading your dashboard…</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 space-y-2">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p className="text-gray-600">You need to be logged in to view the dashboard.</p>
      </div>
    );
  }

  const displayEmail = user.email || "user";

  if (user.role === "client") {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Welcome back, {displayEmail}! Track your onboarding progress.
            </p>
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading your status...</p>
          </div>
        ) : onboardingStatus ? (
          <OnboardingStatusCard status={onboardingStatus} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Get Started</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Begin your onboarding process to track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs lg:text-sm text-muted-foreground mb-4">
                You haven't started the onboarding process yet. Click the button below to begin.
              </p>
              <Button onClick={() => window.location.href = "/portal"}>Start Onboarding</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Recent Notifications</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Stay updated with the latest messages</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <NotificationList showAll={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => window.location.href = "/portal"}>
                <FileText className="h-4 w-4 mr-2" />
                Continue Onboarding
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => window.location.href = "/documents"}>
                <Download className="h-4 w-4 mr-2" />
                View Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Welcome back, {displayEmail}! Here's your credentialing overview.
          </p>
        </div>
      </div>

      {loadingData ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Total Providers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{dashboardStats?.totalProviders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.recentActivity.last7Days || 0} active this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{dashboardStats?.statusCounts.inProgress || 0}</div>
                <p className="text-xs text-muted-foreground">Active onboarding workflows</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Pending Review</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{dashboardStats?.statusCounts.pendingReview || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting admin review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{dashboardStats?.statusCounts.completed || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully credentialed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Client Pipeline</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Provider credentialing workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-base font-medium">Intake</p>
                        <p className="text-xs text-muted-foreground">New provider inquiries</p>
                      </div>
                    </div>
                    <div className="text-lg lg:text-2xl font-bold">{pipelineStats?.intake || 0}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Download className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-base font-medium">Docs Received</p>
                        <p className="text-xs text-muted-foreground">Documents uploaded</p>
                      </div>
                    </div>
                    <div className="text-lg lg:text-2xl font-bold">{pipelineStats?.docsReceived || 0}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-base font-medium">Credentialing Started</p>
                        <p className="text-xs text-muted-foreground">Under review</p>
                      </div>
                    </div>
                    <div className="text-lg lg:text-2xl font-bold">{pipelineStats?.credentialingStarted || 0}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Send className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-base font-medium">Submitted to Payers</p>
                        <p className="text-xs text-muted-foreground">Applications sent</p>
                      </div>
                    </div>
                    <div className="text-lg lg:text-2xl font-bold">{pipelineStats?.submittedToPayers || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Expiring Certifications</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Action required in next 60 days</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardStats?.expiringCertifications && dashboardStats.expiringCertifications.length > 0 ? (
                  <div className="space-y-2 lg:space-y-3 max-h-80 lg:max-h-96 overflow-y-auto">
                    {dashboardStats.expiringCertifications.slice(0, 5).map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 border rounded-lg">
                        <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm font-medium truncate">{cert.userName}</p>
                          <p className="text-xs text-muted-foreground">{cert.licenseState} License</p>
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            {cert.daysUntilExpiration} days remaining
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-10 w-10 lg:h-12 lg:w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-xs lg:text-sm text-muted-foreground">No expiring certifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base lg:text-lg">All Providers</CardTitle>
                  <CardDescription className="text-xs lg:text-sm">{providersData?.total || 0} total providers</CardDescription>
                </div>
                <div className="relative w-full lg:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 lg:p-3 text-xs lg:text-sm font-medium">Provider</th>
                        <th className="text-left p-2 lg:p-3 text-xs lg:text-sm font-medium">Status</th>
                        <th className="text-left p-2 lg:p-3 text-xs lg:text-sm font-medium hidden md:table-cell">Current Step</th>
                        <th className="text-left p-2 lg:p-3 text-xs lg:text-sm font-medium hidden sm:table-cell">Documents</th>
                        <th className="text-left p-2 lg:p-3 text-xs lg:text-sm font-medium hidden lg:table-cell">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProviders.length > 0 ? (
                        filteredProviders.slice(0, 10).map((provider) => (
                          <tr key={provider.userId} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="p-2 lg:p-3">
                              <div>
                                <p className="text-xs lg:text-sm font-medium">{provider.firstName} {provider.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{provider.email}</p>
                              </div>
                            </td>
                            <td className="p-2 lg:p-3">{getStatusBadge(provider.status)}</td>
                            <td className="p-2 lg:p-3 text-xs lg:text-sm capitalize hidden md:table-cell">{provider.currentStep.replace(/-/g, ' ')}</td>
                            <td className="p-2 lg:p-3 text-xs lg:text-sm hidden sm:table-cell">{provider.documentCount}</td>
                            <td className="p-2 lg:p-3 text-xs lg:text-sm text-muted-foreground hidden lg:table-cell">{formatDate(provider.lastUpdated)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs lg:text-sm text-muted-foreground">
                            No providers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

