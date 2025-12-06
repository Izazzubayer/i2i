'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 mt-auto">
      <div className="container px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="i2i Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">i2i</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AI-powered image processing for modern businesses
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/upload" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Upload
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/how-i2i-works" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Legal</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} i2i. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
