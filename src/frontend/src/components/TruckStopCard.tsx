import { Clock, DollarSign, Droplets, MapPin, Star, Truck } from "lucide-react";
import { useState } from "react";
import type { TruckStop } from "../backend.d";
import { getChainBadgeStyle, getChainConfig } from "../lib/chainConfig";
import {
  formatRelativeTime,
  getAvailabilityStatus,
  getStatusClasses,
  getStatusLabel,
} from "../lib/formatters";
import { AvailabilityUpdateModal } from "./AvailabilityUpdateModal";

interface TruckStopCardProps {
  stop: TruckStop;
  paymentMode: "cash" | "points";
  index: number;
}

export function TruckStopCard({
  stop,
  paymentMode,
  index,
}: TruckStopCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const config = getChainConfig(stop.chain);
  const badgeStyle = getChainBadgeStyle(stop.chain);
  const available = Number(stop.availableShowers);
  const total = Number(stop.totalShowers);
  const status = getAvailabilityStatus(
    stop.availableShowers,
    stop.totalShowers,
  );
  const statusClasses = getStatusClasses(status);
  const progressPct = total > 0 ? Math.round((available / total) * 100) : 0;

  const cardIndex = index + 1;

  return (
    <>
      <article
        data-ocid={`stop.card.${cardIndex}`}
        className={`
          relative overflow-hidden rounded-lg border border-border card-shine shadow-card
          transition-all duration-200 hover:shadow-card-hover hover:border-border
          flex flex-col
        `}
      >
        {/* Status glow strip */}
        <div
          className={`
            absolute inset-x-0 top-0 h-0.5 rounded-t-lg
            ${status === "available" ? "bg-status-available" : status === "partial" ? "bg-status-partial" : "bg-status-full"}
          `}
        />

        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full font-body ${badgeStyle}`}
                >
                  {stop.chain}
                </span>
              </div>
              <h3 className="font-display font-bold text-foreground text-base leading-snug truncate">
                {stop.name}
              </h3>
            </div>

            {/* Availability badge — the key visual */}
            <div
              className={`
                flex-shrink-0 flex flex-col items-center justify-center
                rounded-lg px-3 py-2 border ${statusClasses.badge} ${statusClasses.glow}
                min-w-[72px]
              `}
            >
              <span className="text-xs font-bold tracking-widest font-body">
                {getStatusLabel(status)}
              </span>
              <span className="text-lg font-black font-display leading-tight">
                {available}/{total}
              </span>
            </div>
          </div>

          {/* Location row */}
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {stop.city}, {stop.state}
              </span>
            </span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <Truck className="w-3.5 h-3.5" />
              <span>{stop.highway}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground font-body">
              <span className={statusClasses.text}>
                {available} of {total} available
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${statusClasses.bar}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Duration + payment info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-body">
                {config.showerDurationMinutes} min shower
              </span>
            </div>

            {paymentMode === "cash" ? (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-lg font-black font-display text-primary">
                  ${config.cashPrice}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-bold font-body text-primary">
                    Earn {config.pointsEarned} pts
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-body">
                  Redeem {config.pointsToRedeem} pts free
                </span>
              </div>
            )}
          </div>

          {/* Rewards program + last updated */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-1 text-muted-foreground text-xs font-body">
              <Droplets className="w-3 h-3" />
              <span className="truncate">{config.rewardProgramName}</span>
            </div>
            <span className="text-xs text-muted-foreground font-body flex-shrink-0">
              {formatRelativeTime(stop.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Update button */}
        <div className="px-4 pb-4">
          <button
            type="button"
            data-ocid={`stop.update_button.${cardIndex}`}
            onClick={() => setModalOpen(true)}
            className="
              w-full py-2 px-4 rounded-md text-sm font-semibold font-body
              bg-secondary text-secondary-foreground
              hover:bg-accent hover:text-accent-foreground
              transition-colors duration-150
              border border-border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            Update Availability
          </button>
        </div>
      </article>

      <AvailabilityUpdateModal
        stop={stop}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
