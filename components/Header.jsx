'use client'

import { useState } from 'react'
import { Home, DollarSign, Image, ChevronDown, User, Globe, Code, Mail, HelpCircle, Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import NextImage from 'next/image'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { label: 'Home', icon: Home, href: '/', path: '/' },
    { label: 'Upload', icon: Image, href: '/upload', path: '/upload' },
    { label: 'Portfolio', icon: Image, href: '/portfolio', path: '/portfolio' },
    { label: 'Pricing', icon: DollarSign, href: '/pricing', path: '/pricing' },
  ]

  const resourcesItems = [
    { label: 'How i2i Works', icon: Sparkles, href: '/how-i2i-works' },
    { label: 'API', icon: Code, href: '/api-docs' },
    { label: 'Contact', icon: Mail, href: '/contact' },
    { label: 'FAQ', icon: HelpCircle, href: '/faq' },
  ]

  const isResourcesActive = pathname?.startsWith('/how-i2i-works') || pathname?.startsWith('/api-docs') || pathname?.startsWith('/contact') || pathname?.startsWith('/faq')

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <NextImage
            src="/logo.png"
            alt="i2i Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold">i2i</h1>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold">i2i</h1>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navigationItems.map((item) => {
            return (
              <Button 
                key={item.href}
                variant={pathname === item.path ? 'secondary' : 'ghost'} 
                size="sm" 
                asChild
              >
                <a href={item.href}>
                  {item.label}
                </a>
              </Button>
            )
          })}
          
          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isResourcesActive ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-2"
              >
                Resources
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {resourcesItems.map((item) => {
                return (
                  <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

        </nav>

        {/* Right Side - Auth & Language - Desktop */}
        <nav className="hidden lg:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => router.push('/sign-in')}
          >
            <User className="h-4 w-4" />
            Log In
          </Button>
          <span className="text-muted-foreground">·</span>
          <Button 
            size="sm" 
            onClick={() => router.push('/sign-up')}
          >
            Sign Up
          </Button>

          {/* Language Selector */}
          <Select defaultValue="en">
            <SelectTrigger className="w-auto h-8 border-0 bg-transparent hover:bg-muted px-2">
              <Globe className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>
        </nav>

        {/* Mobile Menu Button */}
        <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-left">Navigation</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-2">
              {navigationItems.map((item) => {
                return (
                  <Button
                    key={item.href}
                    variant={pathname === item.path ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
              
              {/* Resources Section */}
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">Resources</p>
                {resourcesItems.map((item) => {
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push(item.href)
                        setMobileMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </div>

              {/* Auth Buttons */}
              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    router.push('/sign-in')
                    setMobileMenuOpen(false)
                  }}
                >
                  <User className="h-4 w-4" />
                  Log In
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    router.push('/sign-up')
                    setMobileMenuOpen(false)
                  }}
                >
                  Sign Up
                </Button>
              </div>

              {/* Language Selector */}
              <div className="pt-2">
                <Select defaultValue="en">
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  )
}

