# Live GPS Tracking Setup Guide

## Overview

Go Cargo Logistics uses enterprise-grade mapping and routing services:
- **Mapbox GL JS** - Interactive maps with smooth animations
- **HERE Maps API** - Geocoding, routing, and ETA calculations

## Quick Setup (5 minutes)

### Step 1: Get Mapbox Access Token

1. Go to [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/)
2. Create a free account (no credit card required for development)
3. Navigate to "Access Tokens" in your account dashboard
4. Copy your **Default Public Token** (starts with `pk.`)
5. Paste into `.env.local`:
   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
   ```

**Mapbox Free Tier:**
- 50,000 map loads/month
- Unlimited map interactions
- Perfect for development and small-scale production

### Step 2: Get HERE Maps API Key

1. Go to [https://platform.here.com/sign-up](https://platform.here.com/sign-up)
2. Create a free account
3. Create a new project in the HERE Platform dashboard
4. Generate an API key with these permissions:
   - ✅ Geocoding & Search API
   - ✅ Routing API v8
   - ✅ Maps API
5. Copy your API key
6. Paste into `.env.local`:
   ```bash
   NEXT_PUBLIC_HERE_MAPS_API_KEY=your_here_maps_api_key_here
   ```

**HERE Maps Free Tier:**
- 250,000 transactions/month
- Includes geocoding and routing
- Perfect for logistics applications

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

Or click "Restart Server" in the Softgen interface.

## Configuration File

Your `.env.local` should look like this:

```bash
# Supabase (Already Configured ✓)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Mapbox (ADD THIS)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here

# HERE Maps (ADD THIS)
NEXT_PUBLIC_HERE_MAPS_API_KEY=your_key_here

# Other services...
```

## Verification

After configuration, the Live GPS Tracking system will:

1. ✅ Load interactive map with zoom/pan controls
2. ✅ Automatically geocode pickup and delivery addresses
3. ✅ Calculate optimal truck routing
4. ✅ Display animated vehicle movement
5. ✅ Show distance, duration, and ETA
6. ✅ Update in real-time with shipment status changes

## Troubleshooting

### "Map configuration incomplete" message
- Check that both API keys are in `.env.local`
- Verify no typos in variable names
- Restart the development server
- Make sure keys start with correct prefixes (Mapbox: `pk.`, HERE: any format)

### Map loads but routes don't calculate
- Verify HERE Maps API key has Routing API enabled
- Check browser console for API errors
- Verify addresses are valid and geocodable

### Map tiles not loading
- Verify Mapbox token is valid and active
- Check for quota/rate limit issues in Mapbox dashboard
- Ensure firewall/network allows Mapbox CDN

## Production Deployment

### Environment Variables on Vercel

When deploying to Vercel:

1. Go to Project Settings → Environment Variables
2. Add both keys:
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - `NEXT_PUBLIC_HERE_MAPS_API_KEY`
3. Set scope to "Production, Preview, Development"
4. Redeploy the application

### API Key Security

✅ **Safe to expose (client-side):**
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Already restricted by domain
- `NEXT_PUBLIC_HERE_MAPS_API_KEY` - Can be restricted in HERE dashboard

⚠️ **Security Best Practices:**
1. Restrict Mapbox tokens to your domain in dashboard
2. Restrict HERE API key to your domain/app ID
3. Monitor usage in both dashboards
4. Rotate keys if compromised

## Cost Estimates

### Development (Free)
- Both services: $0/month
- Sufficient for testing and development

### Production (Low Traffic)
- <1,000 shipments/month: $0/month (within free tiers)
- 1,000-10,000 shipments/month: ~$10-50/month combined

### Production (High Traffic)
- 10,000+ shipments/month: Custom pricing available
- Contact providers for volume discounts

## API Features Used

### Mapbox GL JS
- Interactive map rendering
- Zoom/pan controls
- Custom markers (pickup, delivery, vehicle)
- Route line visualization
- Smooth animations
- Fullscreen mode

### HERE Maps API
- **Geocoding**: Address → Coordinates
- **Routing**: Truck-optimized routes
- **Traffic**: Real-time traffic data
- **ETA**: Accurate delivery estimates
- **Distance**: Precise route measurements

## Support

- **Mapbox Documentation**: [docs.mapbox.com](https://docs.mapbox.com/)
- **HERE Maps Documentation**: [developer.here.com](https://developer.here.com/)
- **Project Issues**: Contact Go Cargo Logistics support

## Next Steps

Once configured, the Live GPS Tracking system will be fully operational. Test by:

1. Creating a test shipment in Admin Dashboard
2. Viewing tracking page with tracking number
3. Verifying map loads and route displays
4. Checking vehicle animation along route
5. Confirming ETA and distance calculations

All features will work automatically with no additional code changes required.