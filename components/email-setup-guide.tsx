"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Mail, CheckCircle, AlertCircle } from "lucide-react"

export function EmailSetupGuide() {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600">
          To enable email functionality, you need to configure your email server settings. Add these environment
          variables:
        </p>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm space-y-2">
            <div>
              <strong>EMAIL_HOST</strong>=smtp.gmail.com
            </div>
            <div>
              <strong>EMAIL_PORT</strong>=587
            </div>
            <div>
              <strong>EMAIL_SECURE</strong>=false
            </div>
            <div>
              <strong>EMAIL_USER</strong>=your-email@gmail.com
            </div>
            <div>
              <strong>EMAIL_PASS</strong>=your-app-password
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                <span className="text-sm font-bold px-2">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Gmail Setup (Recommended)</h4>
                <p className="text-sm text-gray-600 mb-2">For Gmail, you'll need to create an App Password:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Enable 2-Factor Authentication on your Google account</li>
                  <li>Go to Google Account settings → Security → App passwords</li>
                  <li>Generate a new app password for "Mail"</li>
                  <li>Use this app password (not your regular password)</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                  <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer">
                    Gmail App Password Guide <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                <span className="text-sm font-bold px-2">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Other Email Providers</h4>
                <p className="text-sm text-gray-600">Common SMTP settings:</p>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div>
                    <strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com:587
                  </div>
                  <div>
                    <strong>Yahoo:</strong> smtp.mail.yahoo.com:587
                  </div>
                  <div>
                    <strong>Custom SMTP:</strong> Contact your email provider
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-1">
                <span className="text-sm font-bold px-2">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Add Environment Variables</h4>
                <p className="text-sm text-gray-600">
                  Add the variables to your .env.local file and restart your application
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Security Note</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Never use your main email password. Always use app-specific passwords or OAuth when available.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="font-semibold">Free to Use</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Most email providers offer free SMTP access for personal and small business use!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
