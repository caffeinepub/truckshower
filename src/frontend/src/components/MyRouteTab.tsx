import { Route, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SEED_ALERTS, US_STATES } from "../lib/alertsData";
import {
  type RouteFilter,
  clearRoute,
  matchesRoute,
  saveRoute,
} from "../lib/routeData";
import { SEED_WEIGH_STATIONS } from "../lib/weighStationsData";

interface MyRouteTabProps {
  routeFilter: RouteFilter | null;
  onRouteChange: (filter: RouteFilter | null) => void;
  stopCount: number; // total stops from backend for preview
}

export function MyRouteTab({
  routeFilter,
  onRouteChange,
  stopCount,
}: MyRouteTabProps) {
  const [highwayInput, setHighwayInput] = useState(
    routeFilter?.highways.join(", ") ?? "",
  );
  const [selectedStates, setSelectedStates] = useState<string[]>(
    routeFilter?.states ?? [],
  );

  function toggleState(st: string) {
    setSelectedStates((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st],
    );
  }

  function handleSetRoute() {
    const highways = highwayInput
      .split(",")
      .map((h) => h.trim().toUpperCase())
      .filter(Boolean);

    if (highways.length === 0 && selectedStates.length === 0) {
      toast.error("Enter at least one highway or select a state.");
      return;
    }

    const filter: RouteFilter = { highways, states: selectedStates };
    saveRoute(filter);
    onRouteChange(filter);
    toast.success("Route saved — all tabs are now filtered.");
  }

  function handleClearRoute() {
    clearRoute();
    onRouteChange(null);
    setHighwayInput("");
    setSelectedStates([]);
    toast.success("Route cleared.");
  }

  // Preview counts based on seeded data + stopCount approximation
  const preview = useMemo(() => {
    if (!routeFilter) return null;
    const alertMatches = SEED_ALERTS.filter((a) =>
      matchesRoute(routeFilter, a.highway, a.state),
    ).length;
    const weighMatches = SEED_WEIGH_STATIONS.filter((w) =>
      matchesRoute(routeFilter, w.highway, w.state),
    ).length;

    // Approximate stops: if no route or empty filter, use total
    const hasHighways = routeFilter.highways.length > 0;
    const hasStates = routeFilter.states.length > 0;
    const stopsApprox =
      hasHighways || hasStates
        ? Math.max(1, Math.round(stopCount * 0.35))
        : stopCount;

    return {
      alerts: alertMatches,
      weighStations: weighMatches,
      stops: stopsApprox,
    };
  }, [routeFilter, stopCount]);

  const isRouteActive = !!routeFilter;

  return (
    <div className="flex flex-col gap-0 px-4 pb-4">
      {/* Header */}
      <div className="pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <Route className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              My Route
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Filter stops, alerts &amp; weigh stations to your corridor
            </p>
          </div>
        </div>
      </div>

      {/* Active route indicator */}
      {isRouteActive && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-available/10 border border-status-available/30">
          <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
          <span className="text-xs font-semibold font-body text-status-available">
            Route active — all tabs are filtered
          </span>
          <button
            type="button"
            data-ocid="myroute.clear_button"
            onClick={handleClearRoute}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-body text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Route
          </button>
        </div>
      )}

      {/* Highway input */}
      <div className="flex flex-col gap-1.5 mb-4">
        <label
          htmlFor="highway-input"
          className="text-sm font-semibold font-body text-foreground"
        >
          Highways on your route
        </label>
        <div className="relative">
          <input
            id="highway-input"
            data-ocid="myroute.highway_input"
            type="text"
            value={highwayInput}
            onChange={(e) => setHighwayInput(e.target.value)}
            placeholder="e.g. I-80, I-76, I-70"
            className="
              w-full pl-4 pr-10 py-3 rounded-lg
              bg-card border border-border
              text-foreground placeholder:text-muted-foreground
              font-body text-sm
              focus:outline-none focus:ring-2 focus:ring-ring
              transition-colors
            "
          />
          {highwayInput && (
            <button
              type="button"
              onClick={() => setHighwayInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-body">
          Comma-separated (e.g. I-80, I-76)
        </p>
      </div>

      {/* State chips */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold font-body text-foreground">
            States on your route
          </span>
          {selectedStates.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedStates([])}
              className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {US_STATES.map((st, i) => {
            const selected = selectedStates.includes(st);
            return (
              <button
                type="button"
                key={st}
                data-ocid={`myroute.state_chip.${i + 1}`}
                onClick={() => toggleState(st)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-bold font-body
                  border transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary/50 shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Set Route button */}
      <button
        type="button"
        data-ocid="myroute.set_button"
        onClick={handleSetRoute}
        className="
          w-full py-3 px-4 rounded-lg
          bg-primary text-primary-foreground
          font-display font-bold text-sm
          hover:bg-primary/90 active:bg-primary/80
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          flex items-center justify-center gap-2
        "
      >
        <Route className="w-4 h-4" />
        {isRouteActive ? "Update Route" : "Set Route"}
      </button>

      {/* Preview panel — shown when route is active */}
      {isRouteActive && preview ? (
        <div
          data-ocid="myroute.preview.panel"
          className="mt-4 px-4 py-3 rounded-lg bg-card border border-border"
        >
          <p className="text-xs font-semibold font-body text-muted-foreground mb-2 uppercase tracking-wider">
            Along your route
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-bold font-display text-foreground">
                {preview.stops}
              </span>
              <span className="text-xs font-body text-muted-foreground">
                stops
              </span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-bold font-display text-foreground">
                {preview.alerts}
              </span>
              <span className="text-xs font-body text-muted-foreground">
                alerts
              </span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-sm font-bold font-display text-foreground">
                {preview.weighStations}
              </span>
              <span className="text-xs font-body text-muted-foreground">
                weigh stations
              </span>
            </div>
          </div>
        </div>
      ) : (
        !isRouteActive && (
          <div className="mt-6 flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center">
              <TriangleAlert className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-display font-bold text-foreground">
              No route set
            </p>
            <p className="text-sm text-muted-foreground font-body text-center max-w-xs">
              Enter your highways and states above to filter all tabs to your
              corridor.
            </p>
          </div>
        )
      )}
    </div>
  );
}
