export interface RouteFilter {
  highways: string[]; // e.g. ["I-80", "I-76"]
  states: string[]; // e.g. ["WY", "CO", "PA"]
}

const STORAGE_KEY = "truckshower_route";

export function loadRoute(): RouteFilter | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "highways" in parsed &&
      "states" in parsed &&
      Array.isArray((parsed as RouteFilter).highways) &&
      Array.isArray((parsed as RouteFilter).states)
    ) {
      return parsed as RouteFilter;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveRoute(r: RouteFilter): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  } catch {
    // silently fail if localStorage is unavailable
  }
}

export function clearRoute(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

/** Normalize highway strings: "i-80" -> "I-80", "i80" -> "I-80", "80" -> "I-80" */
function normalizeHighway(hw: string): string {
  const trimmed = hw.trim().toUpperCase().replace(/\s+/g, "");
  // Already formatted like "I-80"
  if (/^[A-Z]+-\d+/.test(trimmed)) return trimmed;
  // "I80" -> "I-80", "US30" -> "US-30"
  const match = trimmed.match(/^([A-Z]+)(\d+.*)$/);
  if (match) return `${match[1]}-${match[2]}`;
  return trimmed;
}

export function matchesRoute(
  filter: RouteFilter,
  highway: string,
  state: string,
): boolean {
  if (filter.highways.length === 0 && filter.states.length === 0) return true;

  const normalizedItemHighway = normalizeHighway(highway);

  const highwayMatch =
    filter.highways.length > 0 &&
    filter.highways.some((h) => normalizeHighway(h) === normalizedItemHighway);

  const stateMatch =
    filter.states.length > 0 &&
    filter.states.some(
      (s) => s.trim().toUpperCase() === state.trim().toUpperCase(),
    );

  return highwayMatch || stateMatch;
}
