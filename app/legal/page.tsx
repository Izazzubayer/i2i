"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const policies = [
  {
    title: 'Terms of Service',
    summary: 'Responsibilities between i2i and your organization for use of the platform.',
  },
  {
    title: 'Privacy Policy',
    summary: 'How we collect, process, and store data uploaded through i2i.',
  },
  {
    title: 'Data Processing Addendum',
    summary: 'Contractual clauses for teams handling personal or sensitive data.',
  },
  {
    title: 'Account Deletion',
    summary: 'Process for exporting data and removing your presence from i2i systems.',
  },
]

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Legal & Compliance</h1>
          <p className="text-muted-foreground">
            Review legal documentation, export reports, and manage compliance requests.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy.title}>
              <CardHeader>
                <CardTitle>{policy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{policy.summary}</p>
                <p className="mt-4 text-sm font-medium text-primary cursor-pointer">
                  Download latest version
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
