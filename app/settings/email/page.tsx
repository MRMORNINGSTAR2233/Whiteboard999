"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Check } from "lucide-react"

export default function EmailSettingsPage() {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  const handleResendVerification = async () => {
    setIsSending(true)
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification email")
      }

      toast({
        title: "Email Sent",
        description: "Verification email has been sent to your inbox",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Settings</h1>
        <p className="text-muted-foreground">
          Manage your email preferences and verification status
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </CardTitle>
            <CardDescription>
              Verify your email address to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  Your email needs to be verified
                </p>
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={isSending}
                variant="outline"
              >
                {isSending ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">What happens when you verify?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Receive notifications for whiteboard shares
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Get notified about comments and mentions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Enable password reset functionality
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Choose what emails you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Whiteboard Shares</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone shares a whiteboard with you
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" aria-label="Enable whiteboard shares notifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Comments</p>
                <p className="text-sm text-muted-foreground">
                  Receive emails when someone comments on your whiteboards
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" aria-label="Enable comments notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Collaboration Updates</p>
                <p className="text-sm text-muted-foreground">
                  Get updates about collaborative editing sessions
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" aria-label="Enable collaboration updates notifications" />
            </div>

            <Button className="w-full" disabled>
              Save Preferences (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>
              For administrators: Configure email service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                Setup Instructions
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>1. Sign up for Resend at https://resend.com</li>
                <li>2. Get your API key from https://resend.com/api-keys</li>
                <li>3. Add RESEND_API_KEY to your .env.local file</li>
                <li>4. Optionally set EMAIL_FROM for custom sender address</li>
                <li>5. Emails will be sent automatically for:</li>
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Email verification on signup</li>
                  <li>• Whiteboard share notifications</li>
                  <li>• Comment notifications</li>
                  <li>• Password reset requests</li>
                </ul>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
