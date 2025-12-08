'use client'

import { useState, useEffect } from 'react'
import { Home, DollarSign, Image, ChevronDown, User, Globe, Code, Mail, HelpCircle, Menu, Sparkles, Shield, Bell, CreditCard, LogOut, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import NextImage from 'next/image'
import Link from 'next/link'
import { signout } from '@/api/auth/auth'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('authToken')
        
        // User is authenticated if they have user data OR token
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } else if (token) {
          // If only token exists, create minimal user object
          setUser({
            name: 'User',
            email: '',
            avatar: '',
            initials: 'U',
            credits: 0,
            plan: 'Free'
          })
        } else {
          // No user data or token
          setUser(null)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        setUser(null)
      }
    }

    // Initial load
    getUserData()
    
    // Listen for storage changes (works across tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'authToken') {
        getUserData()
      }
    }
    
    // Custom event for same-tab storage changes
    const handleCustomStorageChange = () => {
      getUserData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
    }
  }, [])

  // Get user initials from name or email
  const getUserInitials = (userData) => {
    if (!userData) return 'U'
    if (userData.displayName) {
      const names = userData.displayName.split(' ')
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (userData.name) {
      const names = userData.name.split(' ')
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (userData.email) {
      return userData.email[0].toUpperCase()
    }
    return 'U'
  }

  const handleSignOut = async () => {
    try {
      await signout()
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('localStorageChange'))
      }
      toast.success('Signed out successfully')
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('localStorageChange'))
      }
      toast.error('Signed out (API call failed, but local session cleared)')
      window.location.href = '/'
    }
  }

  // Use user data or fallback
  const userData = user ? {
    name: user.displayName || user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.avatar || '',
    initials: getUserInitials(user),
    credits: user.credits || 0,
    plan: user.plan || 'Free'
  } : null

  const isAuthenticated = !!user

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
                <Link href={item.href}>
                  {item.label}
                </Link>
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
          {isAuthenticated ? (
            <>
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

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {userData?.initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{userData?.name || 'User'}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={userData?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                          {userData?.initials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{userData?.name || 'User'}</div>
                        <div className="text-xs text-muted-foreground truncate">{userData?.email || ''}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/security')} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Login & Security
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/notifications')} className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/billing')} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/integrations')} className="cursor-pointer">
                    <Cloud className="mr-2 h-4 w-4" />
                    Integrations
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
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
            </>
          )}
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

              {/* Auth Buttons or User Menu */}
              <div className="pt-4 border-t space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {userData?.initials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{userData?.name || 'User'}</div>
                        <div className="text-xs text-muted-foreground truncate">{userData?.email || ''}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        router.push('/account')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <User className="h-4 w-4" />
                      Account
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        router.push('/billing')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <CreditCard className="h-4 w-4" />
                      Billing
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

