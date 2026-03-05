import { Toaster } from "@/components/ui/sonner";
import {
  AlertCircle,
  DollarSign,
  Loader2,
  RefreshCw,
  Route,
  Scale,
  Search,
  Settings,
  ShowerHead,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { TruckStop } from "./backend.d";
import { AdminPanel } from "./components/AdminPanel";
import { MyRouteTab } from "./components/MyRouteTab";
import { RoadAlertsTab } from "./components/RoadAlertsTab";
import { RouteFilterBanner } from "./components/RouteFilterBanner";
import { TruckStopCard } from "./components/TruckStopCard";
import { WeighStationsTab } from "./components/WeighStationsTab";
import { useActor } from "./hooks/useActor";
import {
  useGetAllTruckStops,
  useIsCallerAdmin,
  useSeedSampleData,
} from "./hooks/useQueries";
import { getAvailabilityStatus } from "./lib/formatters";
import {
  type RouteFilter,
  clearRoute,
  loadRoute,
  matchesRoute,
} from "./lib/routeData";

type AppTab = "showers" | "alerts" | "weighstations" | "myroute";
type FilterTab = "all" | "available" | "full";
type PaymentMode = "cash" | "points";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Showers Tab Content ─────────────────────────────────────────────────────

interface ShowersTabProps {
  onAdminOpen: () => void;
  showAdmin: boolean;
  routeFilter?: RouteFilter | null;
  onRouteChange?: (filter: RouteFilter | null) => void;
}

function ShowersTab({
  onAdminOpen,
  showAdmin,
  routeFilter,
  onRouteChange,
}: ShowersTabProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [seeded, setSeeded] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { isFetching: actorLoading } = useActor();
  const stopsQuery = useGetAllTruckStops();
  const seedMutation = useSeedSampleData();

  useEffect(() => {
    const doSeed = async () => {
      if (
        !seeded &&
        !stopsQuery.isFetching &&
        stopsQuery.data !== undefined &&
        stopsQuery.data.length === 0 &&
        !actorLoading
      ) {
        setSeeded(true);
        try {
          await seedMutation.mutateAsync();
          await stopsQuery.refetch();
        } catch {
          toast.error("Could not seed sample data.");
        }
      }
    };
    doSeed();
  }, [
    stopsQuery.data,
    stopsQuery.isFetching,
    actorLoading,
    seeded,
    seedMutation.mutateAsync,
    stopsQuery.refetch,
  ]);

  const filteredStops = useMemo<TruckStop[]>(() => {
    if (!stopsQuery.data) return [];
    let stops = stopsQuery.data;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      stops = stops.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.chain.toLowerCase().includes(q) ||
          s.highway.toLowerCase().includes(q),
      );
    }
    if (filter === "available") {
      stops = stops.filter((s) => {
        const status = getAvailabilityStatus(
          s.availableShowers,
          s.totalShowers,
        );
        return status === "available" || status === "partial";
      });
    } else if (filter === "full") {
      stops = stops.filter((s) => {
        const status = getAvailabilityStatus(
          s.availableShowers,
          s.totalShowers,
        );
        return status === "full";
      });
    }
    if (routeFilter) {
      stops = stops.filter((s) =>
        matchesRoute(routeFilter, s.highway, s.state),
      );
    }
    return stops.slice().sort((a, b) => {
      const order = { available: 0, partial: 1, full: 2 };
      const sa = getAvailabilityStatus(a.availableShowers, a.totalShowers);
      const sb = getAvailabilityStatus(b.availableShowers, b.totalShowers);
      return order[sa] - order[sb];
    });
  }, [stopsQuery.data, debouncedSearch, filter, routeFilter]);

  const handleRefresh = useCallback(() => {
    stopsQuery.refetch();
    toast.success("Refreshing data...");
  }, [stopsQuery]);

  const isLoading =
    actorLoading || stopsQuery.isLoading || seedMutation.isPending;
  const isError = stopsQuery.isError;

  const stats = useMemo(() => {
    const all = stopsQuery.data ?? [];
    const withShowers = all.filter((s) => s.totalShowers > 0n);
    const open = all.filter((s) => {
      const st = getAvailabilityStatus(s.availableShowers, s.totalShowers);
      return st === "available" || st === "partial";
    });
    return {
      total: all.length,
      open: open.length,
      full: all.length - open.length,
      totalAvailable: withShowers.reduce(
        (acc, s) => acc + Number(s.availableShowers),
        0,
      ),
    };
  }, [stopsQuery.data]);

  return (
    <div className="flex flex-col gap-0">
      {/* Inner header actions row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Showers
          </h2>
          <p className="text-xs text-muted-foreground font-body">
            Live availability
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
            <span className="text-xs text-muted-foreground font-body">
              Live
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={stopsQuery.isFetching}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${stopsQuery.isFetching ? "animate-spin" : ""}`}
            />
          </button>
          {showAdmin && (
            <button
              type="button"
              data-ocid="admin.open_modal_button"
              onClick={onAdminOpen}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {/* Route filter banner */}
        {routeFilter && (
          <RouteFilterBanner
            routeFilter={routeFilter}
            onClear={() => {
              clearRoute();
              onRouteChange?.(null);
            }}
          />
        )}

        {/* Stats bar */}
        {!isLoading &&
          !isError &&
          stopsQuery.data &&
          stopsQuery.data.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-status-available" />
                <span className="text-xs font-body text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    {stats.open}
                  </span>{" "}
                  open
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-status-full" />
                <span className="text-xs font-body text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    {stats.full}
                  </span>{" "}
                  full
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border flex-shrink-0">
                <ShowerHead className="w-3 h-3 text-primary" />
                <span className="text-xs font-body text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    {stats.totalAvailable}
                  </span>{" "}
                  ready
                </span>
              </div>
            </div>
          )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            data-ocid="dashboard.search_input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by stop, city, state, highway..."
            className="
              w-full pl-10 pr-10 py-3 rounded-lg
              bg-card border border-border
              text-foreground placeholder:text-muted-foreground
              font-body text-sm
              focus:outline-none focus:ring-2 focus:ring-ring
              transition-colors
            "
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs + Payment toggle */}
        <div className="flex items-center justify-between gap-3">
          <div
            data-ocid="dashboard.filter.tab"
            className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border"
          >
            {(["all", "available", "full"] as FilterTab[]).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setFilter(tab)}
                className={`
                  px-2.5 py-1.5 rounded-md text-xs font-semibold font-body
                  transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${
                    filter === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                `}
              >
                {tab === "all"
                  ? `All (${stats.total})`
                  : tab === "available"
                    ? `Open (${stats.open})`
                    : `Full (${stats.full})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
            <button
              type="button"
              data-ocid="dashboard.payment_toggle.button"
              onClick={() => setPaymentMode("cash")}
              className={`
                flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold font-body
                transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${paymentMode === "cash" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}
              `}
            >
              <DollarSign className="w-3 h-3" />
              Cash
            </button>
            <button
              type="button"
              data-ocid="dashboard.payment_toggle.button"
              onClick={() => setPaymentMode("points")}
              className={`
                flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold font-body
                transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${paymentMode === "points" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}
              `}
            >
              <Star className="w-3 h-3" />
              Points
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            data-ocid="dashboard.loading_state"
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-foreground">
                Loading stops...
              </p>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {seedMutation.isPending
                  ? "Setting up sample data..."
                  : "Fetching live data"}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div
            data-ocid="dashboard.error_state"
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-foreground">
                Failed to load
              </p>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Could not fetch truck stop data.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filteredStops.length === 0 && (
          <div
            data-ocid="stop.list.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
              <ShowerHead className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-foreground">
                No stops found
              </p>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {search
                  ? `No results for "${search}"`
                  : routeFilter
                    ? "No stops on your route match this filter."
                    : "No truck stops match this filter."}
              </p>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Cards grid */}
        {!isLoading && !isError && filteredStops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in pb-2">
            {filteredStops.map((stop, i) => (
              <TruckStopCard
                key={stop.id.toString()}
                stop={stop}
                paymentMode={paymentMode}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("showers");
  const [adminOpen, setAdminOpen] = useState(false);
  const [routeFilter, setRouteFilter] = useState<RouteFilter | null>(loadRoute);
  const stopsQuery = useGetAllTruckStops();
  const adminQuery = useIsCallerAdmin();

  const handleRouteChange = useCallback((filter: RouteFilter | null) => {
    setRouteFilter(filter);
  }, []);

  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "showers",
      label: "Showers",
      icon: <ShowerHead className="w-5 h-5" />,
    },
    {
      id: "alerts",
      label: "Road Alerts",
      icon: <TriangleAlert className="w-5 h-5" />,
    },
    {
      id: "weighstations",
      label: "Weigh Stations",
      icon: <Scale className="w-5 h-5" />,
    },
    {
      id: "myroute",
      label: "My Route",
      icon: <Route className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "font-body bg-card border-border text-foreground",
        }}
      />

      {/* App Header */}
      <header className="sticky top-0 z-30 gradient-header">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <ShowerHead className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg leading-none text-foreground">
              TruckShower
            </h1>
            <p className="text-xs text-muted-foreground font-body leading-tight">
              Showers · Alerts · Weigh Stations
            </p>
          </div>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="flex-1 max-w-3xl mx-auto w-full overflow-auto pb-20">
        {activeTab === "showers" && (
          <ShowersTab
            onAdminOpen={() => setAdminOpen(true)}
            showAdmin={!!adminQuery.data}
            routeFilter={routeFilter}
            onRouteChange={handleRouteChange}
          />
        )}
        {activeTab === "alerts" && (
          <RoadAlertsTab
            routeFilter={routeFilter}
            onRouteChange={handleRouteChange}
          />
        )}
        {activeTab === "weighstations" && (
          <WeighStationsTab
            routeFilter={routeFilter}
            onRouteChange={handleRouteChange}
          />
        )}
        {activeTab === "myroute" && (
          <MyRouteTab
            routeFilter={routeFilter}
            onRouteChange={handleRouteChange}
            stopCount={stopsQuery.data?.length ?? 0}
          />
        )}
      </main>

      {/* Footer — only on showers tab, above bottom nav */}
      {activeTab === "showers" && (
        <div className="max-w-3xl mx-auto w-full px-4 pb-2">
          <p className="text-center text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 gradient-header border-t border-border bottom-nav-safe">
        <div className="max-w-3xl mx-auto flex items-stretch">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const ocid =
              tab.id === "showers"
                ? "nav.showers_tab"
                : tab.id === "alerts"
                  ? "nav.alerts_tab"
                  : tab.id === "weighstations"
                    ? "nav.weighstations_tab"
                    : "nav.myroute_tab";
            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={ocid}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2
                  transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                `}
              >
                <span
                  className={`
                    relative flex items-center justify-center
                    ${isActive ? "scale-110" : "scale-100"}
                    transition-transform duration-150
                  `}
                >
                  {tab.icon}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </span>
                <span
                  className={`text-[10px] font-semibold font-body leading-none ${isActive ? "text-primary" : ""}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Admin Panel */}
      {adminOpen && (
        <AdminPanel
          stops={stopsQuery.data ?? []}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}
