import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Plus,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ALERT_TYPES,
  ALERT_TYPE_STYLES,
  type AlertType,
  DIRECTIONS,
  type Direction,
  type RouteAlert,
  SEED_ALERTS,
  US_STATES,
} from "../lib/alertsData";
import { formatRelativeTime } from "../lib/formatters";
import { type RouteFilter, matchesRoute } from "../lib/routeData";
import { RouteFilterBanner } from "./RouteFilterBanner";

function getAlertAccentClass(type: AlertType): string {
  if (type === "Closure" || type === "Accident") return "alert-accent-red";
  if (type === "Traffic" || type === "Weather") return "alert-accent-amber";
  if (type === "Construction") return "alert-accent-blue";
  return "alert-accent-gray";
}

function formatMs(ms: number): bigint {
  return BigInt(ms) * 1_000_000n;
}

interface PostAlertForm {
  highway: string;
  state: string;
  direction: Direction | "";
  type: AlertType | "";
  description: string;
  alternateRoute: string;
}

const EMPTY_FORM: PostAlertForm = {
  highway: "",
  state: "",
  direction: "",
  type: "",
  description: "",
  alternateRoute: "",
};

interface RoadAlertsTabProps {
  routeFilter?: RouteFilter | null;
  onRouteChange?: (filter: RouteFilter | null) => void;
}

export function RoadAlertsTab({
  routeFilter,
  onRouteChange,
}: RoadAlertsTabProps) {
  const [alerts, setAlerts] = useState<RouteAlert[]>(SEED_ALERTS);
  const [postOpen, setPostOpen] = useState(false);
  const [form, setForm] = useState<PostAlertForm>(EMPTY_FORM);
  const [typeFilter, setTypeFilter] = useState<AlertType | "All">("All");
  const [stateFilter, setStateFilter] = useState<string>("All");

  function handleVoteActive(id: string) {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, activeVotes: a.activeVotes + 1 } : a,
      ),
    );
    toast.success("Marked as still active");
  }

  function handleVoteCleared(id: string) {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const clearedVotes = a.clearedVotes + 1;
        const cleared = clearedVotes > a.activeVotes + 5;
        return { ...a, clearedVotes, cleared };
      }),
    );
    toast.success("Voted as cleared");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.highway ||
      !form.state ||
      !form.direction ||
      !form.type ||
      !form.description
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const newAlert: RouteAlert = {
      id: `alert-${Date.now()}`,
      highway: form.highway.toUpperCase(),
      state: form.state,
      direction: form.direction as Direction,
      type: form.type as AlertType,
      description: form.description,
      alternateRoute: form.alternateRoute || undefined,
      postedAt: Date.now(),
      activeVotes: 1,
      clearedVotes: 0,
      cleared: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setForm(EMPTY_FORM);
    setPostOpen(false);
    toast.success("Alert posted — thank you!");
  }

  const filteredAlerts = useMemo(() => {
    let list = alerts;
    if (typeFilter !== "All") {
      list = list.filter((a) => a.type === typeFilter);
    }
    if (stateFilter !== "All") {
      list = list.filter((a) => a.state === stateFilter);
    }
    if (routeFilter) {
      list = list.filter((a) => matchesRoute(routeFilter, a.highway, a.state));
    }
    // Active first, then by most recent
    return list.slice().sort((a, b) => {
      if (a.cleared !== b.cleared) return a.cleared ? 1 : -1;
      return b.postedAt - a.postedAt;
    });
  }, [alerts, typeFilter, stateFilter, routeFilter]);

  const activeCount = alerts.filter((a) => !a.cleared).length;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Road Alerts
          </h2>
          <p className="text-xs text-muted-foreground font-body">
            {activeCount} active alerts from drivers
          </p>
        </div>
        <button
          type="button"
          data-ocid="alerts.post_button"
          onClick={() => setPostOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold font-body hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post Alert
        </button>
      </div>

      {/* Route filter banner */}
      {routeFilter && (
        <RouteFilterBanner
          routeFilter={routeFilter}
          onClear={() => onRouteChange?.(null)}
        />
      )}

      {/* Filter chips */}
      <div className="space-y-2">
        <div data-ocid="alerts.filter.tab" className="flex gap-1.5 flex-wrap">
          {(["All", ...ALERT_TYPES] as Array<AlertType | "All">).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`
                px-2.5 py-1 rounded-full text-xs font-semibold font-body transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>

        {/* State filter */}
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger
            data-ocid="alerts.state_select"
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
      </div>

      {/* Alert cards */}
      {filteredAlerts.length === 0 ? (
        <div
          data-ocid="alerts.list.empty_state"
          className="flex flex-col items-center justify-center py-20 gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center">
            <TriangleAlert className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-display font-bold text-foreground">No alerts</p>
          <p className="text-sm text-muted-foreground font-body text-center">
            {routeFilter
              ? "No alerts on your route. Roads are clear!"
              : "No road alerts match your filters. Roads are clear!"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredAlerts.map((alert, i) => {
            const styles = ALERT_TYPE_STYLES[alert.type];
            const accentClass = getAlertAccentClass(alert.type);
            const cardIdx = i + 1;
            return (
              <article
                key={alert.id}
                data-ocid={`alerts.card.${cardIdx}`}
                className={`
                  rounded-lg border border-border card-shine overflow-hidden
                  ${accentClass}
                  ${alert.cleared ? "alert-cleared" : ""}
                `}
              >
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Highway badge */}
                      <span className="px-2 py-0.5 rounded text-sm font-black font-display bg-foreground/10 text-foreground border border-border">
                        {alert.highway}
                      </span>
                      {/* Direction */}
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold font-body bg-secondary text-secondary-foreground border border-border">
                        {alert.direction}
                      </span>
                      {/* State */}
                      <span className="text-xs font-body text-muted-foreground">
                        {alert.state}
                      </span>
                    </div>

                    {/* Type badge */}
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold font-body ${styles.badge}`}
                    >
                      {alert.type}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Alternate route */}
                  {alert.alternateRoute && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-emerald-950/40 border border-emerald-500/25">
                      <Navigation className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-body text-emerald-300">
                        <span className="font-semibold">Alt: </span>
                        {alert.alternateRoute}
                      </p>
                    </div>
                  )}

                  {/* Footer: time + votes */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatRelativeTime(formatMs(alert.postedAt))}
                      </span>
                    </div>

                    {alert.cleared ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-body border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        CLEARED
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          data-ocid={`alerts.active_button.${cardIdx}`}
                          onClick={() => handleVoteActive(alert.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-body bg-secondary hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Active {alert.activeVotes}</span>
                        </button>
                        <button
                          type="button"
                          data-ocid={`alerts.cleared_button.${cardIdx}`}
                          onClick={() => handleVoteCleared(alert.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-body bg-secondary hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Cleared {alert.clearedVotes}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Post Alert Dialog */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent
          data-ocid="alerts.post.dialog"
          className="max-w-sm bg-card border-border mx-auto max-h-[90dvh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-yellow-400" />
              Post Road Alert
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Highway */}
            <div className="space-y-1.5">
              <Label className="font-body text-foreground text-sm">
                Highway *
              </Label>
              <Input
                data-ocid="alerts.highway_input"
                value={form.highway}
                onChange={(e) =>
                  setForm((p) => ({ ...p, highway: e.target.value }))
                }
                placeholder="e.g. I-80, US-30"
                className="bg-secondary border-border font-body"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* State */}
              <div className="space-y-1.5">
                <Label className="font-body text-foreground text-sm">
                  State *
                </Label>
                <Select
                  value={form.state}
                  onValueChange={(v) => setForm((p) => ({ ...p, state: v }))}
                >
                  <SelectTrigger
                    data-ocid="alerts.state_select"
                    className="bg-secondary border-border font-body"
                  >
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-52">
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s} className="font-body">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Direction */}
              <div className="space-y-1.5">
                <Label className="font-body text-foreground text-sm">
                  Direction *
                </Label>
                <Select
                  value={form.direction}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, direction: v as Direction }))
                  }
                >
                  <SelectTrigger
                    data-ocid="alerts.direction_select"
                    className="bg-secondary border-border font-body"
                  >
                    <SelectValue placeholder="Dir" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d} value={d} className="font-body">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Alert type */}
            <div className="space-y-1.5">
              <Label className="font-body text-foreground text-sm">
                Alert Type *
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as AlertType }))
                }
              >
                <SelectTrigger
                  data-ocid="alerts.type_select"
                  className="bg-secondary border-border font-body"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ALERT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="font-body">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-body text-foreground text-sm">
                Description *
              </Label>
              <Textarea
                data-ocid="alerts.description_textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe the situation..."
                className="bg-secondary border-border font-body resize-none"
                rows={3}
                required
              />
            </div>

            {/* Alternate route */}
            <div className="space-y-1.5">
              <Label className="font-body text-foreground text-sm">
                Alternate Route{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                data-ocid="alerts.alternate_input"
                value={form.alternateRoute}
                onChange={(e) =>
                  setForm((p) => ({ ...p, alternateRoute: e.target.value }))
                }
                placeholder="e.g. Take US-30 through Cheyenne"
                className="bg-secondary border-border font-body"
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPostOpen(false)}
                className="flex-1 border-border font-body"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="alerts.post.submit_button"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body"
              >
                Post Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
