---
title: Simplify Tracking Map - Remove GPS Features
status: in_progress
priority: urgent
type: refactor
tags: [simplification, maps, tracking]
created_by: agent
created_at: 2026-06-30T20:28:00Z
position: 18
---

## Notes
Remove complex GPS tracking features and replace with simple static map showing shipment route from pickup to delivery. No API keys required, no real-time tracking, just a clean visual representation of the shipment journey.

## Checklist
- [ ] Simplify ShipmentMap component
- [ ] Remove GPS monitoring service dependency
- [ ] Remove HERE Maps API requirement
- [ ] Use Mapbox's built-in geocoding (no external API)
- [ ] Remove automatic status update logic
- [ ] Remove real-time coordinate tracking
- [ ] Keep simple pickup/delivery markers
- [ ] Keep basic route line visualization
- [ ] Update database to remove GPS coordinate columns
- [ ] Remove GPS-related services from codebase
- [ ] Test simplified map functionality
- [ ] Ensure fast loading without API calls

## Acceptance
- Map shows simple route from pickup to delivery ✓
- No external API requirements ✓
- Fast loading (< 500ms) ✓
- Clean, minimal UI ✓
- Works without any configuration ✓