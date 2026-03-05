export type AlertType =
  | "Traffic"
  | "Weather"
  | "Construction"
  | "Accident"
  | "Closure"
  | "Other";

export type Direction = "NB" | "SB" | "EB" | "WB" | "Both";

export interface RouteAlert {
  id: string;
  highway: string;
  state: string;
  direction: Direction;
  type: AlertType;
  description: string;
  alternateRoute?: string;
  postedAt: number; // ms timestamp
  activeVotes: number;
  clearedVotes: number;
  cleared: boolean;
}

export const ALERT_TYPE_STYLES: Record<
  AlertType,
  { badge: string; border: string; dot: string }
> = {
  Closure: {
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    border: "border-red-500/40",
    dot: "bg-red-400",
  },
  Accident: {
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    border: "border-red-500/40",
    dot: "bg-red-400",
  },
  Traffic: {
    badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  Weather: {
    badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  Construction: {
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  Other: {
    badge: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
};

const NOW = Date.now();

export const SEED_ALERTS: RouteAlert[] = [
  {
    id: "alert-1",
    highway: "I-80",
    state: "WY",
    direction: "EB",
    type: "Weather",
    description:
      "Black ice and blowing snow between Laramie and Rawlins. Chains required.",
    alternateRoute: "Consider US-30 through Cheyenne",
    postedAt: NOW - 45 * 60_000,
    activeVotes: 24,
    clearedVotes: 3,
    cleared: false,
  },
  {
    id: "alert-2",
    highway: "I-40",
    state: "NM",
    direction: "WB",
    type: "Construction",
    description:
      "Lane closures near Albuquerque MM 145-162, expect 45 min delay",
    alternateRoute: "Take NM-333 to bypass",
    postedAt: NOW - 2.5 * 3_600_000,
    activeVotes: 18,
    clearedVotes: 2,
    cleared: false,
  },
  {
    id: "alert-3",
    highway: "I-70",
    state: "CO",
    direction: "EB",
    type: "Closure",
    description:
      "Eisenhower Tunnel closed due to accident. All traffic diverted.",
    alternateRoute: "US-6 over Loveland Pass (trucks over 50k lbs prohibited)",
    postedAt: NOW - 1.2 * 3_600_000,
    activeVotes: 41,
    clearedVotes: 5,
    cleared: false,
  },
  {
    id: "alert-4",
    highway: "I-10",
    state: "TX",
    direction: "EB",
    type: "Accident",
    description:
      "Multi-vehicle accident near San Antonio, right 2 lanes blocked",
    postedAt: NOW - 30 * 60_000,
    activeVotes: 15,
    clearedVotes: 1,
    cleared: false,
  },
  {
    id: "alert-5",
    highway: "I-90",
    state: "MT",
    direction: "WB",
    type: "Weather",
    description: "Heavy snow and whiteout conditions. Travel not advised.",
    alternateRoute: "Delay travel or use I-94 south",
    postedAt: NOW - 3 * 3_600_000,
    activeVotes: 33,
    clearedVotes: 4,
    cleared: false,
  },
  {
    id: "alert-6",
    highway: "I-95",
    state: "VA",
    direction: "NB",
    type: "Construction",
    description: "Bridge work near Fredericksburg, reduced to 1 lane 11pm-5am",
    postedAt: NOW - 5 * 3_600_000,
    activeVotes: 12,
    clearedVotes: 8,
    cleared: false,
  },
  {
    id: "alert-7",
    highway: "I-55",
    state: "IL",
    direction: "SB",
    type: "Traffic",
    description: "Major slowdown near Chicago south suburbs, 60 min delay",
    alternateRoute: "I-57 to bypass",
    postedAt: NOW - 20 * 60_000,
    activeVotes: 28,
    clearedVotes: 2,
    cleared: false,
  },
  {
    id: "alert-8",
    highway: "I-75",
    state: "GA",
    direction: "NB",
    type: "Accident",
    description:
      "Semi rollover near Atlanta I-285 interchange, all lanes blocked",
    alternateRoute: "I-285 east to I-85 north",
    postedAt: NOW - 15 * 60_000,
    activeVotes: 52,
    clearedVotes: 7,
    cleared: false,
  },
  {
    id: "alert-9",
    highway: "I-76",
    state: "PA",
    direction: "EB",
    type: "Weather",
    description: "Freezing rain on PA Turnpike. Reduced speed 45 mph.",
    postedAt: NOW - 4 * 3_600_000,
    activeVotes: 19,
    clearedVotes: 6,
    cleared: false,
  },
  {
    id: "alert-10",
    highway: "I-5",
    state: "CA",
    direction: "NB",
    type: "Traffic",
    description:
      "Grapevine pass congested due to inspection stop, 90 min delay",
    alternateRoute: "CA-138 east to I-15",
    postedAt: NOW - 50 * 60_000,
    activeVotes: 37,
    clearedVotes: 5,
    cleared: false,
  },
];

export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export const ALERT_TYPES: AlertType[] = [
  "Traffic",
  "Weather",
  "Construction",
  "Accident",
  "Closure",
  "Other",
];

export const DIRECTIONS: Direction[] = ["NB", "SB", "EB", "WB", "Both"];
