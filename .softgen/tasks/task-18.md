---
title: Simplify Tracking Map - Remove GPS Features
status: done
priority: urgent
type: refactor
tags: [simplification, maps, tracking]
created_by: agent
created_at: 2026-06-30T20:28:00Z
position: 18
---

## Notes
Simplified GPS tracking to basic shipment route visualization. Removed complex GPS monitoring, HERE Maps API, and real-time coordinate tracking. Now uses only Mapbox with built-in geocoding for simple pickup-to-delivery route display. Includes elegant fallback UI when Mapbox isn't configured.

## Checklist
- [x] Simplify ShipmentMap component (removed 200+ lines of complexity)
- [x] Remove GPS monitoring service dependency (gpsMonitoringService.ts deleted)
- [x] Remove HERE Maps API requirement (hereMapsService.ts deleted)
- [x] Use Mapbox's built-in geocoding (no external API)
- [x] Remove automatic status update logic
- [x] Remove real-time coordinate tracking
- [x] Keep simple pickup/delivery markers
- [x] Keep basic route line visualization (straight line between locations)
- [x] Remove GPS coordinate columns from database
- [x] Add elegant fallback UI for unconfigured API
- [x] Test simplified map functionality
- [x] Ensure fast loading (< 500ms)

## Acceptance
- Map shows simple route from pickup to delivery ✓
- Only Mapbox required (optional, has fallback) ✓
- Fast loading (< 500ms) ✓
- Clean, minimal UI ✓
- Works with and without API configuration ✓
- Zero complex dependencies ✓