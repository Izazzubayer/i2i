'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  Shirt, 
  ShoppingBag, 
  Watch, 
  Gem, 
  Droplet, 
  Sofa, 
  Home, 
  Laptop,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BeforeAfterSlider } from '@/components/portfolio/BeforeAfterSlider'
import { cn } from '@/lib/utils'

const categories = [
  { 
    id: 'all', 
    name: 'All Categories', 
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'apparel', 
    name: 'Apparel', 
    icon: Shirt,
    color: 'from-blue-500 to-cyan-500',
    description: 'Fashion photography enhancement, color correction, and background removal'
  },
  { 
    id: 'footwear', 
    name: 'Footwear', 
    icon: ShoppingBag,
    color: 'from-orange-500 to-red-500',
    description: 'Product photography refinement with shadow enhancement and detail optimization'
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    icon: Watch,
    color: 'from-green-500 to-emerald-500',
    description: 'Jewelry and accessory retouching with precision and clarity'
  },
  { 
    id: 'jewellery', 
    name: 'Jewellery', 
    icon: Gem,
    color: 'from-yellow-500 to-amber-500',
    description: 'Luxury jewelry enhancement with sparkle effects and reflection'
  },
  { 
    id: 'perfume', 
    name: 'Perfume & Cosmetics', 
    icon: Droplet,
    color: 'from-pink-500 to-rose-500',
    description: 'Beauty product photography with premium finishing'
  },
  { 
    id: 'furniture', 
    name: 'Furniture', 
    icon: Sofa,
    color: 'from-indigo-500 to-purple-500',
    description: 'Interior design and furniture imagery with lifestyle context'
  },
  { 
    id: 'homewares', 
    name: 'Homewares', 
    icon: Home,
    color: 'from-teal-500 to-cyan-500',
    description: 'Home decor and lifestyle product enhancement'
  },
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: Laptop,
    color: 'from-slate-500 to-gray-500',
    description: 'Tech product photography with sleek professional finish'
  }
]

// Mock portfolio items - In production, fetch from API or CMS
const portfolioItems = [
  {
    id: 1,
    category: 'apparel',
    title: 'Premium T-Shirt Collection',
    before: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=600&fit=crop',
    tags: ['Background Removal', 'Color Enhancement', 'Shadow Correction']
  },
  {
    id: 2,
    category: 'apparel',
    title: 'Designer Dress Photography',
    before: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop',
    tags: ['Wrinkle Removal', 'Color Grading', 'Model Retouching']
  },
  {
    id: 3,
    category: 'footwear',
    title: 'Sneaker Product Shot',
    before: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop',
    tags: ['Shadow Enhancement', 'Detail Sharpening', 'Background Cleanup']
  },
  {
    id: 4,
    category: 'footwear',
    title: 'Luxury Leather Shoes',
    before: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&h=600&fit=crop',
    tags: ['Texture Enhancement', 'Reflection Add', 'Professional Finish']
  },
  {
    id: 5,
    category: 'accessories',
    title: 'Luxury Watch Photography',
    before: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&h=600&fit=crop',
    tags: ['Metal Polish', 'Glass Reflection', 'Precision Editing']
  },
  {
    id: 6,
    category: 'accessories',
    title: 'Designer Handbag',
    before: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop',
    tags: ['Texture Detail', 'Color Correction', 'Studio Enhancement']
  },
  {
    id: 7,
    category: 'jewellery',
    title: 'Diamond Ring Showcase',
    before: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    tags: ['Sparkle Enhancement', 'Reflection', 'Luxury Finish']
  },
  {
    id: 8,
    category: 'jewellery',
    title: 'Gold Necklace Collection',
    before: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop',
    tags: ['Shine Effect', 'Detail Enhancement', 'Premium Look']
  },
  {
    id: 9,
    category: 'perfume',
    title: 'Luxury Fragrance Bottle',
    before: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=600&fit=crop',
    tags: ['Glass Effect', 'Lighting Enhancement', 'Elegant Finish']
  },
  {
    id: 10,
    category: 'perfume',
    title: 'Cosmetic Product Line',
    before: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
    tags: ['Product Arrangement', 'Color Pop', 'Beauty Enhancement']
  },
  {
    id: 11,
    category: 'furniture',
    title: 'Modern Living Room Set',
    before: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    tags: ['Lifestyle Context', 'Lighting Adjustment', 'Space Enhancement']
  },
  {
    id: 12,
    category: 'furniture',
    title: 'Luxury Dining Table',
    before: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop',
    tags: ['Wood Texture', 'Ambient Lighting', 'Professional Staging']
  },
  {
    id: 13,
    category: 'homewares',
    title: 'Kitchen Utensil Set',
    before: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop',
    tags: ['Product Grouping', 'Clean Background', 'Sharp Details']
  },
  {
    id: 14,
    category: 'homewares',
    title: 'Decorative Vase Collection',
    before: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop',
    tags: ['Artistic Enhancement', 'Color Balance', 'Elegant Presentation']
  },
  {
    id: 15,
    category: 'electronics',
    title: 'Smartphone Photography',
    before: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1592286927505-67eb63926d79?w=800&h=600&fit=crop',
    tags: ['Screen Enhancement', 'Reflection Control', 'Sleek Finish']
  },
  {
    id: 16,
    category: 'electronics',
    title: 'Laptop Product Shot',
    before: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
    after: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop',
    tags: ['Tech Product Polish', 'Background Gradient', 'Modern Look']
  }
]

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredItems = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Minimal Hero Section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-6xl">
              Portfolio
            </h1>
            
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Explore our AI-powered transformations across different product categories
            </p>
          </motion.div>
        </div>
      </section>

      {/* Floating Category Filter */}
      <section className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bento-Style Grid */}
      <section className="container px-4 py-12">
        <motion.div 
          layout
          className="grid auto-rows-[300px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.map((item, index) => {
            // Create variety in sizes for bento grid effect
            const isLarge = index % 7 === 0
            const isTall = index % 5 === 0 && index % 7 !== 0
            const isWide = index % 6 === 0 && index % 7 !== 0
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900',
                  'transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-300/50 dark:hover:shadow-zinc-950/50',
                  isLarge && 'md:col-span-2 md:row-span-2',
                  isTall && 'md:row-span-2',
                  isWide && 'md:col-span-2'
                )}
              >
                {/* Before/After Slider */}
                <div className="absolute inset-0">
                  <BeforeAfterSlider
                    beforeImage={item.before}
                    afterImage={item.after}
                  />
                </div>

                {/* Overlay with Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/90 text-zinc-900">
                        {categories.find(c => c.id === item.category)?.name}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="text-xs text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Icon Badge */}
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm dark:bg-zinc-900/90">
                  {(() => {
                    const Icon = categories.find(c => c.id === item.category)?.icon || Sparkles
                    return <Icon className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  })()}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Sparkles className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                No items in this category
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Check back soon for more examples
              </p>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50 md:text-4xl">
              Ready to Transform Your Images?
            </h2>
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
              Start processing your product images with AI in minutes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200">
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-zinc-300 dark:border-zinc-700">
                <Link href="/resources">
                  See How It Works
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
