import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Scale,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { US_STATES } from "../lib/alertsData";
import { formatRelativeTime } from "../lib/formatters";
import { type RouteFilter, matchesRoute } from "../lib/routeData";
import {
  SEED_WEIGH_STATIONS,
  type WeighStation,
} from "../lib/weighStationsData";
import { RouteFilterBanner } from "./RouteFilterBanner";

function formatMs(ms: number): bigint {
  return BigInt(ms) * 1_000_000n;
}

interface UpdateModalProps {
  station: WeighStation;
  onSave: (updated: Partial<WeighStation>) => void;
  onClose: () => void;
}

function UpdateModal({ station, onSave, onClose }: UpdateModalProps) {
  const [scaleOpen, setScaleOpen] = useState(station.scaleOpen);
  const [ezPassOpen, setEzPassOpen] = useState(station.ezPassOpen);
  const [prePassActive, setPrePassActive] = useState(station.prePassActive);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onSave({ scaleOpen, ezPassOpen, prePassActive, lastUpdated: Date.now() });
      toast.success("Station status updated!");
      setSaving(false);
      onClose();
    }, 400);
  }

  return (
    <DialogContent
      data-ocid="weigh.update.dialog"
      className="max-w-sm bg-card border-border mx-auto"
    >
      <DialogHeader>
        <DialogTitle className="font-display text-foreground text-lg">
          Update Station
        </DialogTitle>
        <p className="text-sm text-muted-foreground font-body mt-0.5">
          {station.name} — {station.highway} {station.direction}
        </p>
      </DialogHeader>

      <div className="py-4 space-y-5">
        {/* Scale */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-muted-foreground" />
            <Label className="font-body text-foreground text-sm font-semibold">
              Scale Open
            </Label>
          </div>
          <Switch
            data-ocid="weigh.scale_switch"
            checked={scaleOpen}
            onCheckedChange={setScaleOpen}
          />
        </div>

        {/* EZ-Pass */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <Label className="font-body text-foreground text-sm font-semibold">
              EZ-Pass Lane Open
            </Label>
          </div>
          <Switch
            data-ocid="weigh.ezpass_switch"
            checked={ezPassOpen}
            onCheckedChange={setEzPassOpen}
          />
        </div>

        {/* PrePass */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <Label className="font-body text-foreground text-sm font-semibold">
              PrePass / Bypass Active
            </Label>
          </div>
          <Switch
            data-ocid="weigh.prepass_switch"
            checked={prePassActive}
            onCheckedChange={setPrePassActive}
          />
        </div>
      </div>

      <DialogFooter className="flex gap-2">
        <Button
          type="button"
          data-ocid="weigh.cancel_button"
          variant="outline"
          onClick={onClose}
          className="flex-1 border-border font-body"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          data-ocid="weigh.save_button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Status"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

interface WeighStationsTabProps {
  routeFilter?: RouteFilter | null;
  onRouteChange?: (filter: RouteFilter | null) => void;
}

export function WeighStationsTab({
  routeFilter,
  onRouteChange,
}: WeighStationsTabProps) {
  const [stations, setStations] = useState<WeighStation[]>(SEED_WEIGH_STATIONS);
  const [updateTarget, setUpdateTarget] = useState<WeighStation | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [openOnly, setOpenOnly] = useState(false);

  function handleSave(id: string, partial: Partial<WeighStation>) {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    );
    setUpdateTarget(null);
  }

  const filtered = useMemo(() => {
    let list = stations;
    if (stateFilter !== "All") {
      list = list.filter((s) => s.state === stateFilter);
    }
    if (openOnly) {
      list = list.filter((s) => s.scaleOpen);
    }
    if (routeFilter) {
      list = list.filter((s) => matchesRoute(routeFilter, s.highway, s.state));
    }
    // Open first
    return list.slice().sort((a, b) => {
      if (a.scaleOpen !== b.scaleOpen) return a.scaleOpen ? -1 : 1;
      return 0;
    });
  }, [stations, stateFilter, openOnly, routeFilter]);

  const openCount = stations.filter((s) => s.scaleOpen).length;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Top bar */}
      <div className="pt-4">
        <h2 className="font-display font-bold text-xl text-foreground">
          Weigh Stations
        </h2>
        <p className="text-xs text-muted-foreground font-body">
          {openCount} of {stations.length} stations currently open
        </p>
      </div>

      {/* Route filter banner */}
      {routeFilter && (
        <RouteFilterBanner
          routeFilter={routeFilter}
          onClear={() => onRouteChange?.(null)}
        />
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger
            data-ocid="weigh.filter.select"
            className="w-36 h-8 text-xs bg-card border-border font-body"
          >
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-60">
            <SelectItem value="All" className="font-body text-xs">
              All States
            </SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s} value={s} className="font-body text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          data-ocid="weigh.open_toggle"
          onClick={() => setOpenOnly((v) => !v)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-body
            border transition-all
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${
              openOnly
                ? "bg-primary text-primary-foreground border-primary/50"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }
          `}
        >
          <Scale className="w-3.5 h-3.5" />
          Open Only
        </button>
      </div>

      {/* Station cards */}
      {filtered.length === 0 ? (
        <div
          data-ocid="weigh.list.empty_state"
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center">
            <Scale className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-display font-bold text-foreground">No stations</p>
          <p className="text-sm text-muted-foreground font-body text-center">
            {routeFilter
              ? "No weigh stations on your route."
              : "No weigh stations match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((station, i) => {
            const cardIdx = i + 1;
            const scaleStatusClass = station.scaleOpen
              ? "scale-open"
              : "scale-closed";
            const ezStatusClass = station.ezPassOpen
              ? "ezpass-open"
              : "ezpass-closed";
            const prepassStatusClass = station.prePassActive
              ? "prepass-active"
              : "prepass-inactive";
            return (
              <article
                key={station.id}
                data-ocid={`weigh.card.${cardIdx}`}
                className="rounded-lg border border-border card-shine overflow-hidden flex flex-col shadow-card"
              >
                {/* Status strip */}
                <div
                  className={`h-0.5 w-full ${station.scaleOpen ? "bg-status-available" : "bg-muted-foreground/30"}`}
                />

                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-foreground text-base leading-snug truncate">
                        {station.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-black font-display bg-foreground/10 text-foreground border border-border">
                          {station.highway}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold font-body bg-secondary text-secondary-foreground border border-border">
                          {station.direction}
                        </span>
                        <span className="text-xs font-body text-muted-foreground">
                          {station.milepost}
                        </span>
                      </div>
                    </div>
                    {/* State pill */}
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold font-body bg-card border border-border text-muted-foreground">
                      {station.state}
                    </span>
                  </div>

                  {/* Status badges — the key content */}
                  <div className="space-y-2">
                    {/* Scale */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-semibold font-body text-foreground">
                          Scale
                        </span>
                      </div>
                      <span
                        className={`
                          flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black font-display border
                          ${scaleStatusClass}
                        `}
                      >
                        {station.scaleOpen ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {station.scaleOpen ? "OPEN" : "CLOSED"}
                      </span>
                    </div>

                    {/* EZ-Pass */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-semibold font-body text-foreground">
                          EZ-Pass Lane
                        </span>
                      </div>
                      <span
                        className={`
                          flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black font-display border
                          ${ezStatusClass}
                        `}
                      >
                        {station.ezPassOpen ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {station.ezPassOpen ? "OPEN" : "CLOSED"}
                      </span>
                    </div>

                    {/* PrePass */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-semibold font-body text-foreground">
                          PrePass
                        </span>
                      </div>
                      <span
                        className={`
                          flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black font-display border
                          ${prepassStatusClass}
                        `}
                      >
                        {station.prePassActive ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {station.prePassActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground font-body">
                      {formatRelativeTime(formatMs(station.lastUpdated))}
                    </span>
                    <button
                      type="button"
                      data-ocid={`weigh.update_button.${cardIdx}`}
                      onClick={() => setUpdateTarget(station)}
                      className="
                        px-3 py-1.5 rounded-md text-xs font-semibold font-body
                        bg-secondary text-secondary-foreground
                        hover:bg-accent hover:text-accent-foreground
                        transition-colors border border-border
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      "
                    >
                      Update
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Update dialog */}
      <Dialog
        open={!!updateTarget}
        onOpenChange={(o) => !o && setUpdateTarget(null)}
      >
        {updateTarget && (
          <UpdateModal
            station={updateTarget}
            onSave={(partial) => handleSave(updateTarget.id, partial)}
            onClose={() => setUpdateTarget(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
