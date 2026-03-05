import { X } from "lucide-react";
import type { RouteFilter } from "../lib/routeData";

interface RouteFilterBannerProps {
  routeFilter: RouteFilter;
  onClear: () => void;
}

export function RouteFilterBanner({
  routeFilter,
  onClear,
}: RouteFilterBannerProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border flex-wrap">
      {/* Status dot */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
        <span className="text-xs font-semibold font-body text-status-available">
          Route: ON
        </span>
      </div>

      <div className="w-px h-4 bg-border flex-shrink-0 hidden sm:block" />

      {/* Highway pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {routeFilter.highways.map((hw) => (
          <span
            key={hw}
            className="px-2 py-0.5 rounded text-xs font-black font-display bg-foreground/10 text-foreground border border-border"
          >
            {hw.trim().toUpperCase()}
          </span>
        ))}
        {/* State pills */}
        {routeFilter.states.map((st) => (
          <span
            key={st}
            className="px-2 py-0.5 rounded-full text-xs font-bold font-body bg-secondary text-secondary-foreground border border-border"
          >
            {st}
          </span>
        ))}
      </div>

      {/* Clear button */}
      <button
        type="button"
        data-ocid="route.banner.clear_button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-body text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0"
      >
        <X className="w-3 h-3" />
        Clear
      </button>
    </div>
  );
}
