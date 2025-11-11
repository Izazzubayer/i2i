'use client'

import { Moon, Sun, Zap, Home, Package, Code, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { darkMode, toggleDarkMode } = useStore()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">i2i</h1>
            <p className="text-xs text-muted-foreground">AI Image Processing</p>
          </div>
        </div>

          {/* Navigation Links - Centered */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Button 
              variant={pathname === '/' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-2" 
              asChild
            >
              <a href="/">
                <Home className="h-4 w-4" />
                Home
              </a>
            </Button>
            <Button 
              variant={pathname?.startsWith('/orders') ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-2" 
              asChild
            >
              <a href="/orders">
                <Package className="h-4 w-4" />
                My Orders
              </a>
            </Button>
            <Button 
              variant={pathname?.startsWith('/api-docs') ? 'secondary' : 'ghost'} 
              size="sm" 
              className="gap-2" 
              asChild
            >
              <a href="/api-docs">
                <Code className="h-4 w-4" />
                API
              </a>
            </Button>
          </nav>

        {/* Right Side - Auth & Dark Mode */}
        <nav className="flex items-center gap-2">
          {/* Sign In/Sign Up */}
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
            <User className="h-4 w-4" />
            Sign In
          </Button>
          <Button size="sm" className="hidden sm:flex">
            Sign Up
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  )
}

