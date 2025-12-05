'use client'

/**
 * PlaceholderImage Component
 * 
 * Generates placeholder images for development purposes
 * Replace these with actual product images in production
 */

export function getPlaceholderImage({ category, type, width = 800, height = 600 }) {
  // Color schemes for different categories
  const colorSchemes = {
    apparel: {
      before: '4A5568,718096',
      after: '3182CE,5A67D8'
    },
    footwear: {
      before: '744210,92400E',
      after: 'F97316,FB923C'
    },
    accessories: {
      before: '065F46,047857',
      after: '10B981,34D399'
    },
    jewellery: {
      before: '854D0E,A16207',
      after: 'F59E0B,FBBF24'
    },
    perfume: {
      before: '9F1239,BE123C',
      after: 'F43F5E,FB7185'
    },
    furniture: {
      before: '4C1D95,5B21B6',
      after: '7C3AED,8B5CF6'
    },
    homewares: {
      before: '115E59,134E4A',
      after: '14B8A6,2DD4BF'
    },
    electronics: {
      before: '1E293B,334155',
      after: '475569,64748B'
    }
  }

  const colors = colorSchemes[category] || colorSchemes.apparel
  const colorPair = type === 'before' ? colors.before : colors.after

  // Use placeholder.co service (free placeholder image service)
  return `https://via.placeholder.com/${width}x${height}/${colorPair}/FFFFFF?text=${encodeURIComponent(
    `${category.toUpperCase()} ${type.toUpperCase()}`
  )}`
}

/**
 * Example usage in your portfolio items array:
 * 
 * const portfolioItems = [
 *   {
 *     id: 1,
 *     category: 'apparel',
 *     title: 'Premium T-Shirt',
 *     before: getPlaceholderImage({ category: 'apparel', type: 'before' }),
 *     after: getPlaceholderImage({ category: 'apparel', type: 'after' }),
 *     tags: ['Background Removal', 'Color Enhancement']
 *   }
 * ]
 */

