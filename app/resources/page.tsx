'use client'

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'A quick checklist to help your team onboard in minutes.',
    link: '#',
  },
  {
    title: 'API Documentation',
    description: 'Integrate i2i with your existing pipeline using REST endpoints.',
    link: '#',
  },
  {
    title: 'Style & Prompt Library',
    description: 'Reusable prompt templates curated by the production team.',
    link: '#',
  },
  {
    title: 'Case Studies',
    description: 'Discover how leading brands scaled visuals with i2i.',
    link: '#',
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground">
              Documentation, tutorials, and reference material for the i2i platform.
            </p>
          </div>
          <Button variant="outline">Download PDF Handbook</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={item.link}>
                  <Button variant="outline">Open</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
