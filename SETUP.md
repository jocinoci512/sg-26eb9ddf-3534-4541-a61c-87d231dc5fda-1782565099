# Go Cargo Logistics - Setup Guide

## Required API Keys and Services

### 1. Supabase (Database & Authentication)
Already configured. Credentials are in `.env.local`.

### 2. Mapbox GL JS (Interactive Maps)
**Purpose:** Premium map visualization for shipment tracking

**Setup:**
1. Go to https://account.mapbox.com/
2. Sign up for a free account
3. Navigate to "Access Tokens"
4. Copy your default public token
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
   ```

**Free Tier:** 50,000 map loads/month

### 3. HERE Maps API (Geocoding & Routing)
**Purpose:** Enterprise-grade address geocoding, truck routing, and ETA calculations

**Setup:**
1. Go to https://platform.here.com/
2. Sign up for a Freemium account
3. Create a new project
4. Generate an API key with these permissions:
   - Geocoding & Search API
   - Routing API v8
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_HERE_MAPS_API_KEY=YOUR_HERE_API_KEY
   ```

**Free Tier:** 250,000 transactions/month

### 4. Resend (Email Service)
**Purpose:** Automated email notifications and form submissions

**Setup:**
1. Go to https://resend.com/
2. Sign up for a free account
3. Verify your domain (or use resend.dev for testing)
4. Generate an API key
5. Add to `.env.local` (server-side only):
   ```
   RESEND_API_KEY=re_...
   ```

**Configuration:**
- All emails are sent FROM: `support@gocargologisticsus.com`
- Contact form submissions go TO: `support@gocargologisticsus.com`
- Quote requests go TO: `support@gocargologisticsus.com`
- Customer notifications (shipment updates) sent to customer email addresses

**Free Tier:** 100 emails/day

### 5. Site URL Configuration
Add your production domain to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://gocargologisticsus.com
```

## Complete .env.local Example

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://rkdoanzzutpeguxgdjax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Mapbox Maps
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ...

# HERE Maps
NEXT_PUBLIC_HERE_MAPS_API_KEY=YOUR_HERE_API_KEY_HERE

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://gocargologisticsus.com
```

## Features Requiring API Keys

### Live GPS Tracking (`/tracking` page)
**Requires:**
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Map visualization
- `NEXT_PUBLIC_HERE_MAPS_API_KEY` - Geocoding and routing

**What happens without keys:**
- Shows error message requesting API configuration
- Map does not load

### Contact Form (`/contact` page)
**Requires:**
- `RESEND_API_KEY` - Sends notification to support@gocargologisticsus.com

**What happens without key:**
- Form submission saves to database
- Email notification fails silently (logged in console)
- Admin can still see submission in admin dashboard

### Quote Request Form (`/quote` page)
**Requires:**
- `RESEND_API_KEY` - Sends notification to support@gocargologisticsus.com

**What happens without key:**
- Quote saves to database
- Email notification fails silently
- Admin can view quote in admin quotes section

### Admin Email Notifications
**Requires:**
- `RESEND_API_KEY` - Automated shipment status emails

**What happens without key:**
- Customers do not receive email updates
- Shipment data still updates correctly in database
- Admin can manually inform customers

## Deployment Checklist

Before deploying to production:

1. ✅ Supabase configured
2. ⬜ Mapbox token added
3. ⬜ HERE Maps API key added
4. ⬜ Resend API key added
5. ⬜ Verify domain in Resend dashboard
6. ⬜ Set NEXT_PUBLIC_SITE_URL to production domain
7. ⬜ Test contact form email delivery
8. ⬜ Test quote form email delivery
9. ⬜ Test live GPS tracking map loads
10. ⬜ Verify automated shipment emails send correctly

## Testing Without API Keys

You can test the platform locally without external API keys:
- Database, auth, forms, dashboards, and admin features work fully
- GPS tracking shows configuration error
- Email notifications fail silently but data still saves

For production deployment, all API keys are required for full functionality.

## Support

For questions about API setup or configuration issues:
- Email: support@gocargologisticsus.com
- Phone: +1 (940) 238-4915