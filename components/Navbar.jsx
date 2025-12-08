'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { signout } from '@/api/auth/auth'
import { toast } from 'sonner'
import {
  Home,
  Package,
  Briefcase,
  DollarSign,
  Image as ImageIcon,
  ChevronDown,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Menu,
  X,
  Cloud,
  Code,
  Mail,
  HelpCircle,
  Sparkles,
  Globe,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [navigatingTo, setNavigatingTo] = useState(null)
  const [mounted, setMounted] = useState(false)
  const lastAuthStateRef = useRef(null) // Track last state to avoid unnecessary updates

  // Check authentication status
  // Empty dependency array is intentional - we only want this to run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setMounted(true)
    
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      
      const userData = localStorage.getItem('user')
      const authToken = localStorage.getItem('authToken')
      
      // Debug logging to see what we're finding
      if (!authToken && !userData) {
        // Only log when we don't find anything (to reduce noise)
        console.log('🔍 Navbar: Checking auth - no token or user data found')
      }
      
      // SIMPLE RULE: If token exists, user is authenticated
      // Token is only given after successful signin, so it's the primary indicator
      if (authToken) {
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            const newState = { authenticated: true, userEmail: parsedUser.email }
            
            // Only update if state changed
            if (newState.userEmail !== lastAuthStateRef.current?.userEmail || lastAuthStateRef.current?.authenticated !== true) {
              console.log('✅ Navbar: User authenticated', parsedUser.email || parsedUser.displayName)
              setIsAuthenticated(true)
              setUser(parsedUser)
              lastAuthStateRef.current = newState
            }
            return
          } catch (error) {
            console.error('❌ Navbar: Error parsing user data:', error)
            // Token exists but user data is corrupted - clear everything
            localStorage.removeItem('user')
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            setIsAuthenticated(false)
            setUser(null)
            lastAuthStateRef.current = { authenticated: false }
            return
          }
        } else {
          // Token exists but no user data - still consider authenticated
          if (lastAuthStateRef.current?.authenticated !== true) {
            console.log('⚠️ Navbar: Token exists but no user data - still authenticated')
            setIsAuthenticated(true)
            setUser(null) // Will show default user
            lastAuthStateRef.current = { authenticated: true }
          }
          return
        }
      }
      
      // No token - not authenticated
      if (lastAuthStateRef.current?.authenticated !== false) {
        console.log('❌ Navbar: Not authenticated')
        // Don't clear userData immediately - might be a race condition
        // Only clear if we're sure there's no token
        if (userData && !authToken) {
          // Wait a bit before clearing - token might be stored soon
          setTimeout(() => {
            const stillNoToken = !localStorage.getItem('authToken')
            if (stillNoToken && localStorage.getItem('user')) {
              localStorage.removeItem('user')
            }
          }, 1000)
        }
        setIsAuthenticated(false)
        setUser(null)
        lastAuthStateRef.current = { authenticated: false }
      }
    }

    // Initial check immediately
    checkAuth()
    
    // Also check after short delays to catch data stored just before/after page load
    const delayedCheck1 = setTimeout(() => {
      console.log('🔄 Navbar: Delayed check 1 (100ms)')
      checkAuth()
    }, 100)
    
    const delayedCheck2 = setTimeout(() => {
      console.log('🔄 Navbar: Delayed check 2 (500ms)')
      checkAuth()
    }, 500)
    
    // Check periodically but less frequently (every 2 seconds for first 10 seconds, then every 5)
    // This ensures navbar updates even if events are missed
    let checkCount = 0
    const intervalId = setInterval(() => {
      checkCount++
      if (checkCount <= 5) {
        // Check every 2 seconds for first 10 seconds
        console.log(`🔄 Navbar: Periodic check ${checkCount}`)
        checkAuth()
      } else {
        // Then check every 5 seconds
        checkAuth()
      }
    }, 2000)
    
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'authToken') {
        checkAuth()
      }
    }
    
    const handleCustomStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange)
    window.addEventListener('focus', checkAuth)
    
    // Also check when page becomes visible (after redirect/tab switch)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Navbar: Page visible - checking auth')
        checkAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Check when page loads (in case of hard redirect)
    const handleLoad = () => {
      setTimeout(checkAuth, 50)
    }
    if (document.readyState === 'complete') {
      setTimeout(checkAuth, 50)
    } else {
      window.addEventListener('load', handleLoad)
    }
    
    return () => {
      clearTimeout(delayedCheck1)
      clearTimeout(delayedCheck2)
      clearInterval(intervalId)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
      window.removeEventListener('focus', checkAuth)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('load', handleLoad)
    }
  }, []) // Empty dependency array - intentionally only run on mount

  const handleNavigation = useCallback((path) => {
    setNavigatingTo(path)
    router.prefetch(path)
    requestAnimationFrame(() => {
      router.push(path)
      setTimeout(() => setNavigatingTo(null), 300)
    })
  }, [router])

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

  const userData = user ? {
    name: user.displayName || user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.avatarUrl || user.avatar || '',
    initials: getUserInitials(user),
    images: user.images || 0,
    tokens: user.tokens || 0,
    plan: user.plan || 'Free'
  } : {
    name: 'User',
    email: '',
    avatar: '',
    initials: 'U',
    credits: 0,
    plan: 'Free'
  }

  // Navigation items - different for authenticated vs unauthenticated
  const navItems = isAuthenticated ? [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Upload', href: '/upload', icon: ImageIcon },
    { label: 'Orders', href: '/orders', icon: Package },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { label: 'Pricing', href: '/pricing', icon: DollarSign },
  ] : [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Upload', href: '/upload', icon: ImageIcon },
    { label: 'Portfolio', href: '/portfolio', icon: ImageIcon },
    { label: 'Pricing', href: '/pricing', icon: DollarSign },
  ]

  const resourcesItems = [
    { label: 'API', href: '/api-docs', icon: Code },
    { label: 'Contact', href: '/contact', icon: Mail },
    { label: 'How i2i Works', href: '/how-i2i-works', icon: Sparkles },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
  ]

  const isResourcesActive = pathname?.startsWith('/api-docs') || 
    pathname?.startsWith('/contact') || 
    pathname?.startsWith('/how-i2i-works') || 
    pathname?.startsWith('/faq')

  if (!mounted) {
    // Return a simple header during SSR to prevent hydration mismatch
    return (
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="i2i Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">i2i</span>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo.png"
                alt="i2i Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </motion.div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              i2i
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-5xl mx-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} prefetch={true}>
                  <Button 
                    variant={isActive ? 'secondary' : 'ghost'} 
                    size="sm"
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            
            {/* Resources Dropdown */}
            {resourcesItems.length > 0 && (
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
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} prefetch={true}>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side: Language, Auth/Profile */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
                <DropdownMenuItem>中文</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Section - Show Login/Signup when NOT authenticated */}
            {!isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-2">
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
              </div>
            ) : (
              /* Profile Dropdown - Show when authenticated */
              mounted && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userData.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {userData.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">{userData.name}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    {/* Account Section - Header */}
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userData.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                            {userData.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{userData.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{userData.email}</div>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* Account */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/account')}
                      className="cursor-pointer"
                      disabled={navigatingTo === '/account'}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </DropdownMenuItem>

                    {/* Login & Security */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/account/security')}
                      className="cursor-pointer"
                      disabled={navigatingTo === '/account/security'}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Login & Security
                    </DropdownMenuItem>

                    {/* Notifications */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/account/notifications')}
                      className="cursor-pointer"
                      disabled={navigatingTo === '/account/notifications'}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Billing & Subscription */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/billing')}
                      className="cursor-pointer"
                      disabled={navigatingTo === '/billing'}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing & Subscription
                    </DropdownMenuItem>

                    {/* Integrations */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation('/integrations')}
                      className="cursor-pointer"
                      disabled={navigatingTo === '/integrations'}
                    >
                      <Cloud className="mr-2 h-4 w-4" />
                      Integrations
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Sign Out */}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        variant={isActive ? 'secondary' : 'ghost'} 
                        className="w-full justify-start"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
                
                {/* Resources Section */}
                {resourcesItems.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">Resources</p>
                    {resourcesItems.map((item) => {
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            {item.label}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Auth Section - Mobile */}
                <div className="pt-4 border-t space-y-2">
                  {!isAuthenticated ? (
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
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          handleNavigation('/account')
                          setMobileMenuOpen(false)
                        }}
                      >
                        <User className="h-4 w-4" />
                        Account
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
                  )}
                </div>

                {/* Language Selector - Mobile */}
                <div className="pt-2">
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <SelectValue />
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
