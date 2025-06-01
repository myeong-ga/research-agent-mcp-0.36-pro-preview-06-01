import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Candy, MessageSquare, Search } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
// import { ApiKeyWarning } from "@/components/api-key-warning"
// import { isGoogleApiKeyAvailable } from "@/lib/google-ai"
// import { isOpenAIApiKeyAvailable } from "@/lib/openai-ai"

export default function DashboardPage() {
  // Server-side check for environment variables
//   const isGoogleValid = isGoogleApiKeyAvailable()
//   const isOpenAIValid = isOpenAIApiKeyAvailable()
//   const isValid = isGoogleValid && isOpenAIValid

  return (
    <DashboardLayout>
        {/* <ApiKeyWarning isValid={isValid} /> */}

      <div className="container grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+5.4% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4s</div>
              <p className="text-xs text-muted-foreground">-0.3s from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sources Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="tracking-tight">Recent Activity</CardTitle>
              <CardDescription>Your recent resource management queries and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm ">
                      What emerging digital trends should our resource allocation strategy consider?
                    </p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm ">
                      How can we optimize cloud resource distribution for our dynamic workloads?
                    </p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Identify potential resource bottlenecks in our current digital infrastructure
                    </p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Which emerging startups should we monitor for potential partnership opportunities?
                    </p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                   <p className="text-sm text-muted-foreground">
                      Analyze market volatility impact on our current resource allocation strategy
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-start-3">
            <CardHeader>
              <CardTitle className="tracking-tight">Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full justify-start" size="lg" variant="outline">
                  <Link href="/dashboard/compare">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    LLM Leaderboard
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" size="lg" variant="outline">
                  <Link href="/dashboard/research">
                    <Search className="mr-2 h-5 w-5" />
                    Research
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" size="lg" variant="outline">
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Analytics
                  </Link>
                </Button>
                 <Button asChild className="w-full justify-start bg-pink-100 dark:text-pink-300" size="lg" variant="outline">
                  <Link href="/dashboard/store">
                    <Candy className="mr-2 h-5 w-5" />
                    New 스토어 (MCP)
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
