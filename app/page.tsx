/**
 * i2i Homepage - Modular Page System
 * 
 * This file routes to different homepage styles based on configuration.
 * Change the PAGE_STYLE constant below to switch between layouts:
 * 
 * - 'default'    : Original upload-based workflow (recommended for most users)
 * - 'chat'       : ChatGPT-style conversational interface
 * - 'enterprise' : Enterprise/SME dashboard for large batches (1000+ images)
 * 
 * All pages are fully functional prototypes with consistent branding.
 */

// ============================================
// CONFIGURATION: Change this to switch pages
// ============================================
const PAGE_STYLE: 'default' | 'chat' | 'enterprise' = 'default'
// ============================================

import PageDefault from './PageDefault'
import PageChat from './PageChat'
import PageEnterprise from './PageEnterprise'

export default function Home() {
  switch (PAGE_STYLE) {
    case 'chat':
      return <PageChat />
    case 'enterprise':
      return <PageEnterprise />
    case 'default':
    default:
      return <PageDefault />
  }
}

