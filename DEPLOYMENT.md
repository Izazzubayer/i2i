# Deployment Guide for i2i Platform

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy from GitHub

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Connect to Vercel**:
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repository
- Vercel auto-detects Next.js settings
- Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and your app will be deployed!

## Environment Variables

In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_AI_API_URL=your_ai_service_url
AI_API_KEY=your_secret_key
STORAGE_BUCKET=your_bucket
STORAGE_ACCESS_KEY=your_key
```

## Deploy to Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Add netlify.toml**:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Deploy to AWS Amplify

1. **Connect Repository** in Amplify Console
2. **Build Settings**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run
```bash
docker build -t i2i-platform .
docker run -p 3000:3000 i2i-platform
```

## Production Checklist

### Performance
- [ ] Enable Next.js image optimization
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Minimize bundle size
- [ ] Enable compression

### Security
- [ ] Add authentication (NextAuth.js)
- [ ] Implement rate limiting
- [ ] Sanitize file uploads
- [ ] Use HTTPS only
- [ ] Configure CORS properly
- [ ] Add CSP headers

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Add performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure logging

### Database & Storage
- [ ] Set up production database
- [ ] Configure cloud storage (S3/GCS)
- [ ] Set up backups
- [ ] Configure CDN for images

### AI Integration
- [ ] Replace mock APIs with real AI services
- [ ] Configure AI service credentials
- [ ] Set up rate limiting for AI calls
- [ ] Add fallback mechanisms
- [ ] Implement retry logic

## Scaling Considerations

### For High Traffic

1. **Caching**:
```typescript
// next.config.js
module.exports = {
  images: {
    minimumCacheTTL: 60,
  },
}
```

2. **Database Connection Pooling**
3. **Queue System** for batch processing (Bull, BullMQ)
4. **Horizontal Scaling** with load balancer
5. **CDN** for image delivery

### Serverless Functions

API routes automatically scale on Vercel/Netlify. For heavy processing:
- Use AWS Lambda with longer timeouts
- Implement job queues (SQS, Redis)
- Consider background workers

## SSL Certificate

Most platforms (Vercel, Netlify) provide automatic SSL. For custom domains:

1. **Vercel**: Auto SSL with Let's Encrypt
2. **Manual**: Use Certbot
```bash
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

### Cloudflare
1. Add site to Cloudflare
2. Point A record to your server IP
3. Enable proxy (orange cloud)

## Backup Strategy

### Code
- GitHub/GitLab repository (automatic)

### Database
```bash
# PostgreSQL
pg_dump dbname > backup.sql

# MongoDB
mongodump --out /backup/

# Automated daily backups
0 2 * * * /backup-script.sh
```

### User Files
- S3 bucket versioning enabled
- Cross-region replication
- Glacier for long-term storage

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring Setup

### Sentry Integration

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Performance Optimization

### Image Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Bundle Analysis
```bash
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

## Rollback Strategy

### Vercel
- Automatic deployments with instant rollback
- Go to Deployments → Select previous version → Promote

### Manual
```bash
git revert HEAD
git push origin main
```

## Cost Optimization

### Serverless
- Vercel: Free for hobby, $20/mo Pro
- Netlify: Free for 100GB bandwidth

### Storage
- S3: Pay per GB stored and transferred
- Cloudflare R2: No egress fees

### Database
- Supabase: Free tier available
- PlanetScale: Free tier with auto-scaling
- Neon: Serverless Postgres

## Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}
```

Add to monitoring tools for uptime tracking.

## Support & Troubleshooting

### Common Issues

**Build fails**:
- Check Node version (18+)
- Clear `.next` and `node_modules`
- Verify environment variables

**Images not loading**:
- Check image domains in `next.config.js`
- Verify CORS headers
- Check CDN configuration

**Slow performance**:
- Enable caching
- Optimize images
- Use CDN
- Check database queries

### Getting Help

- Next.js Discord: [discord.gg/nextjs](https://discord.gg/nextjs)
- Vercel Support: support.vercel.com
- GitHub Issues: your-repo/issues

---

Ready to deploy! 🚀

