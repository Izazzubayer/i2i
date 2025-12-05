'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signout } from '@/api/auth/auth'
import { toast } from 'sonner'
import {
  Home,
  Package,
  Briefcase,
  HelpCircle,
  User,
  Globe,
  ChevronDown,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Menu,
  X,
  Trash2,
  Cloud
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
import { Badge } from '@/components/ui/badge'

export default function AuthenticatedNav() {
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
      // Call signout API
      await signout()
      
      // Clear all local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Trigger storage change event to update UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('localStorageChange'))
      }
      
      toast.success('Signed out successfully')
      
      // Redirect to home page with hard navigation to ensure UI updates
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      
      // Clear storage anyway even if API call fails
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Trigger storage change event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('localStorageChange'))
      }
      
      toast.error('Signed out (API call failed, but local session cleared)')
      
      // Redirect to home page
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
  } : {
    name: 'User',
    email: '',
    avatar: '',
    initials: 'U',
    credits: 0,
    plan: 'Free'
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Orders', href: '/orders', icon: Package },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { label: 'Support', href: '/support', icon: HelpCircle },
  ]

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
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side: Language, Profile */}
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

            {/* Profile Dropdown */}
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
                  onClick={() => router.push('/account')}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>

                {/* Login & Security */}
                <DropdownMenuItem
                  onClick={() => router.push('/account/security')}
                  className="cursor-pointer"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Login & Security
                </DropdownMenuItem>

                {/* Notifications */}
                <DropdownMenuItem
                  onClick={() => router.push('/account/notifications')}
                  className="cursor-pointer"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Billing & Subscription */}
                <DropdownMenuItem
                  onClick={() => router.push('/billing')}
                  className="cursor-pointer"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Subscription
                </DropdownMenuItem>


                {/* Integrations */}
                <DropdownMenuItem
                  onClick={() => router.push('/integrations')}
                  className="cursor-pointer"
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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

