# Deployment Guide - DetailerTools.com

## Quick Start

Your site is a **static HTML/CSS/JavaScript** application that works immediately without build steps.

## Local Testing

Simply open `index.html` in a web browser:

```bash
# Option 1: Direct file
open index.html

# Option 2: Python server
python -m http.server 8000
# Visit: http://localhost:8000

# Option 3: Node.js server
npx http-server -p 8000
# Visit: http://localhost:8000
```

## Deployment Options

### 1. Netlify (Recommended)
**Why**: Free, fast, automatic HTTPS, global CDN

**Steps**:
1. Go to https://netlify.com
2. Drag and drop your project folder
3. Done! Your site is live

**Or via Git**:
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Connect to Netlify
# - Login to Netlify
# - Click "New site from Git"
# - Select your repository
# - Deploy settings:
#   - Build command: (leave empty)
#   - Publish directory: .
```

### 2. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### 3. GitHub Pages
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main

# Enable GitHub Pages
# Go to: Settings > Pages
# Source: Deploy from branch
# Branch: main, folder: / (root)
```

### 4. AWS S3 + CloudFront
```bash
# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Enable static hosting
aws s3 website s3://your-bucket-name --index-document index.html

# Upload files
aws s3 sync . s3://your-bucket-name --exclude ".git/*"

# Make public
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://policy.json
```

### 5. Any Web Server
Upload all files via FTP/SFTP to your web server's public directory.

## Required Files

Ensure these files are uploaded:

### Core Pages
- `index.html` - Homepage
- `checker.html` - Word Checker
- `calculator.html` - Calculator
- `blog-dynamic.html` - Blog
- `forum-dynamic.html` - Forum

### Assets
- `styles.css` - Main stylesheet
- `cross-animation.css` - Animations
- All other HTML/CSS/JS files

### Optional (but recommended)
- `README-UPGRADE.md` - Documentation
- `config-template.html` - Supabase setup guide
- `.gitignore` - Git ignore file

## Supabase Setup (Optional)

If you want dynamic blog/forum with database:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create account and new project
   - Wait for database to initialize

2. **Run Migration**
   - The migration has already been applied
   - Tables are created: users, blog_posts, blog_comments, forum_threads, forum_replies

3. **Get Credentials**
   - Settings > API
   - Copy "Project URL"
   - Copy "anon public" key

4. **Add to HTML Files**
   Edit `blog-dynamic.html` and `forum-dynamic.html`, add to `<head>`:
   ```html
   <meta name="supabase-url" content="YOUR_PROJECT_URL">
   <meta name="supabase-anon-key" content="YOUR_ANON_KEY">
   ```

5. **Test**
   - Refresh pages
   - Data should load from database
   - Check browser console for errors

## Custom Domain

### Netlify
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Update DNS records:
   ```
   A    @    75.2.60.5
   CNAME www  your-site.netlify.app
   ```

### Vercel
1. Go to Project Settings > Domains
2. Add domain
3. Follow DNS instructions

### Cloudflare (for any host)
1. Add site to Cloudflare
2. Update nameservers
3. Enable HTTPS, caching, minification

## Performance Optimization

### 1. Enable Compression
Most hosts auto-enable gzip/brotli compression.

### 2. Add Caching Headers
For static hosts, add `_headers` file:
```
/*
  Cache-Control: public, max-age=31536000, immutable
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### 3. CDN Integration
- Netlify/Vercel have built-in CDN
- For custom servers, use CloudFront, Cloudflare, or Fastly

## Environment Variables

Not needed for static site! But if you add backend:

```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

## Troubleshooting

### Pages Don't Load
- Check all files are uploaded
- Verify index.html is in root directory
- Check file permissions (755 for dirs, 644 for files)

### Styles Not Working
- Verify styles.css is uploaded
- Check file paths are relative
- Clear browser cache

### Database Not Connecting
- Verify Supabase meta tags are added
- Check credentials are correct
- Open browser console for errors
- Verify Supabase project is active

### Images Not Showing
- Check image URLs are correct
- Picsum.photos links work globally
- For custom images, upload to /images folder

## Monitoring

### Netlify Analytics
- Built-in analytics available
- Go to Site > Analytics

### Google Analytics
Add to each HTML file before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security

### Headers (add to Netlify/Vercel)
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Content Security Policy
Add meta tag to HTML files:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';">
```

## Backup

### Automated Backup
If using Git + GitHub:
```bash
# Automatic backups with every commit
git add .
git commit -m "Update content"
git push
```

### Manual Backup
Download all files periodically from your host.

## Support & Updates

- All core components work offline
- Blog/Forum have static fallbacks
- No build process required
- Works on any web server

---

**Ready to deploy!** 🚀

Choose your deployment method above and your site will be live in minutes.
