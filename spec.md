# TruckShower

## Current State

Full-stack app with three tabs:
- **Showers**: Lists truck stops with real-time shower availability, cash/points payment toggle, search, and filters. Uses backend API (`getAllTruckStops`).
- **Road Alerts**: Driver-posted disruptions with type/state filters, voting, alternate routes. Frontend-only state (seeded from `alertsData.ts`).
- **Weigh Stations**: Scale/EZ-Pass/PrePass status for weigh stations. Frontend-only state (seeded from `weighStationsData.ts`).

No route filtering currently exists. All three tabs always show all nationwide data.

## Requested Changes (Diff)

### Add
- **"My Route" tab** — fourth bottom nav tab (map/route icon) where a driver enters their planned corridor (one or more highways, e.g. "I-80, I-76, I-70") and optionally a set of states/regions. The route is saved to localStorage.
- **Cross-tab route filter** — a persistent banner/pill at the top of Showers, Road Alerts, and Weigh Stations tabs that shows the active route and lets the driver quickly toggle "route mode" on/off. When on, each tab filters its list to only entries matching the entered highways/states.
- **My Route tab UI** — input for highway(s) (comma-separated), multi-select or chip list for states along the route, a "Set Route" button, and a summary of what will be shown (stops/alerts/weigh stations along the route). Also shows a preview count per tab.

### Modify
- **Bottom nav** — add a 4th tab "My Route" with a Route/Map icon.
- **ShowersTab** — accept and apply a route filter prop; show a filtered-route banner when active.
- **RoadAlertsTab** — accept and apply a route filter prop; show a filtered-route banner when active.
- **WeighStationsTab** — accept and apply a route filter prop; show a filtered-route banner when active.
- **App.tsx** — manage route state at root level, pass down to all tabs, persist to localStorage.

### Remove
- Nothing removed.

## Implementation Plan

1. Create `src/frontend/src/lib/routeData.ts` — types (`RouteFilter`) and localStorage helpers (`loadRoute`, `saveRoute`, `clearRoute`).
2. Create `src/frontend/src/components/MyRouteTab.tsx` — highway input (comma-separated text), state chip multi-select, save/clear route button, preview counts.
3. Create `src/frontend/src/components/RouteFilterBanner.tsx` — small sticky banner shown at top of filtered tabs when a route is active, with highway pills and a clear/toggle button.
4. Update `App.tsx`:
   - Add `myroute` as a 4th `AppTab`.
   - Load route from localStorage on mount.
   - Pass `routeFilter` down to `ShowersTab`, `RoadAlertsTab`, `WeighStationsTab`.
   - Render `<MyRouteTab>` for the new tab.
5. Update `ShowersTab` — add `routeFilter` prop; filter `filteredStops` by matching `highway` or `state` fields; show `<RouteFilterBanner>` when active.
6. Update `RoadAlertsTab` — add `routeFilter` prop; filter alerts by `highway` or `state`; show `<RouteFilterBanner>`.
7. Update `WeighStationsTab` — add `routeFilter` prop; filter stations by `highway` or `state`; show `<RouteFilterBanner>`.
