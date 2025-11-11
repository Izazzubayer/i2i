'use client'

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const mockProjects = [
  {
    id: 'proj-001',
    name: 'E-commerce Catalog',
    description: '120 processed images ready for product launch',
    status: 'Live',
    lastUpdated: 'Nov 10, 2025',
  },
  {
    id: 'proj-002',
    name: 'Marketing Campaign',
    description: '45 lifestyle shots for winter collection',
    status: 'In Review',
    lastUpdated: 'Nov 8, 2025',
  },
  {
    id: 'proj-003',
    name: 'Social Media Content',
    description: '30 square crops optimized for Instagram',
    status: 'Draft',
    lastUpdated: 'Nov 5, 2025',
  },
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Review processed projects, download assets, and share with stakeholders.
            </p>
          </div>
          <Link href="/upload">
            <Button>Upload New Assets</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Last updated {project.lastUpdated}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    View Project
                  </Button>
                  <Button className="flex-1">Download All</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
