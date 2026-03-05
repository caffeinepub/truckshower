/**
 * Format a nanosecond timestamp to a relative "X min ago" string
 */
export function formatRelativeTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const now = Date.now();
  const diff = now - ms;

  if (diff < 0) return "just now";
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) {
    const mins = Math.floor(diff / 60_000);
    return `${mins} min ago`;
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / 86_400_000);
  return `${days}d ago`;
}

/**
 * Get availability status level based on ratio
 */
export type AvailabilityStatus = "available" | "partial" | "full";

export function getAvailabilityStatus(
  available: bigint,
  total: bigint,
): AvailabilityStatus {
  if (total === 0n) return "full";
  if (available === 0n) return "full";
  const ratio = Number(available) / Number(total);
  if (ratio > 0.5) return "available";
  return "partial";
}

export function getStatusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "available":
      return "OPEN";
    case "partial":
      return "LIMITED";
    case "full":
      return "FULL";
  }
}

export function getStatusClasses(status: AvailabilityStatus): {
  badge: string;
  bar: string;
  glow: string;
  text: string;
} {
  switch (status) {
    case "available":
      return {
        badge: "status-available border",
        bar: "bg-status-available",
        glow: "glow-available",
        text: "text-status-available",
      };
    case "partial":
      return {
        badge: "status-partial border",
        bar: "bg-status-partial",
        glow: "glow-partial",
        text: "text-status-partial",
      };
    case "full":
      return {
        badge: "status-full border",
        bar: "bg-status-full",
        glow: "glow-full",
        text: "text-status-full",
      };
  }
}
