"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Brain, Zap, TrendingUp, Clock, AlertTriangle, CheckCircle, Sparkles, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const aiUsageData = [
  { time: "00:00", requests: 45, success: 43, errors: 2 },
  { time: "04:00", requests: 32, success: 31, errors: 1 },
  { time: "08:00", requests: 128, success: 125, errors: 3 },
  { time: "12:00", requests: 245, success: 238, errors: 7 },
  { time: "16:00", requests: 189, success: 185, errors: 4 },
  { time: "20:00", requests: 156, success: 152, errors: 4 },
]

const featureUsageData = [
  { feature: "Diagram Generation", usage: 45, growth: 12 },
  { feature: "Layout Suggestions", usage: 32, growth: 8 },
  { feature: "Content Generation", usage: 28, growth: 15 },
  { feature: "Smart Connections", usage: 18, growth: 22 },
  { feature: "Auto-formatting", usage: 12, growth: 5 },
]

export function AIInsights() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground">Monitor AI performance, usage patterns, and optimization opportunities</p>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Requests Today</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +18.2% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">97.2%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +0.8% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              -0.3s faster
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="w-3 h-3 mr-1 text-blue-500" />
              Optimal performance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume */}
        <Card>
          <CardHeader>
            <CardTitle>AI Request Volume</CardTitle>
            <p className="text-sm text-muted-foreground">Hourly AI requests and success rates</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aiUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#15803d" strokeWidth={2} name="Total Requests" />
                <Line type="monotone" dataKey="success" stroke="#84cc16" strokeWidth={2} name="Successful" />
                <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Most popular AI features and growth rates</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureUsageData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="usage" fill="#15803d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Model Status</CardTitle>
            <p className="text-sm text-muted-foreground">Current model performance and health</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">GPT-4 Turbo</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Load</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Claude 3 Sonnet</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Load</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Diagram Generator</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  High Load
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Load</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground">AI-powered suggestions for system improvements</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Scale Diagram Generator</p>
                  <p className="text-xs text-muted-foreground">High demand detected. Consider adding more instances.</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Apply Scaling
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cache Optimization</p>
                  <p className="text-xs text-muted-foreground">Implement caching for common diagram patterns.</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Enable Caching
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Rate Limiting</p>
                  <p className="text-xs text-muted-foreground">Some users exceeding recommended usage limits.</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Review Limits
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
