export type ChainConfig = {
  showerDurationMinutes: number;
  cashPrice: number;
  rewardProgramName: string;
  pointsEarned: number;
  pointsToRedeem: number;
  color: string; // CSS class suffix for badge
};

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  Pilot: {
    showerDurationMinutes: 10,
    cashPrice: 13,
    rewardProgramName: "myRewards Plus",
    pointsEarned: 75,
    pointsToRedeem: 500,
    color: "pilot",
  },
  "Flying J": {
    showerDurationMinutes: 10,
    cashPrice: 13,
    rewardProgramName: "myRewards Plus",
    pointsEarned: 75,
    pointsToRedeem: 500,
    color: "flyingj",
  },
  "Love's": {
    showerDurationMinutes: 15,
    cashPrice: 12,
    rewardProgramName: "Love's Connect",
    pointsEarned: 50,
    pointsToRedeem: 400,
    color: "loves",
  },
  TA: {
    showerDurationMinutes: 15,
    cashPrice: 14,
    rewardProgramName: "TravelCenters Rewards",
    pointsEarned: 60,
    pointsToRedeem: 450,
    color: "ta",
  },
  Petro: {
    showerDurationMinutes: 15,
    cashPrice: 14,
    rewardProgramName: "TravelCenters Rewards",
    pointsEarned: 60,
    pointsToRedeem: 450,
    color: "petro",
  },
  "TA/Petro": {
    showerDurationMinutes: 15,
    cashPrice: 14,
    rewardProgramName: "TravelCenters Rewards",
    pointsEarned: 60,
    pointsToRedeem: 450,
    color: "petro",
  },
  Speedway: {
    showerDurationMinutes: 10,
    cashPrice: 10,
    rewardProgramName: "Speedy Rewards",
    pointsEarned: 40,
    pointsToRedeem: 350,
    color: "speedway",
  },
  "Kwik Trip": {
    showerDurationMinutes: 10,
    cashPrice: 10,
    rewardProgramName: "Kwik Rewards",
    pointsEarned: 40,
    pointsToRedeem: 350,
    color: "kwiktrip",
  },
};

export const DEFAULT_CHAIN_CONFIG: ChainConfig = {
  showerDurationMinutes: 10,
  cashPrice: 12,
  rewardProgramName: "Loyalty Rewards",
  pointsEarned: 50,
  pointsToRedeem: 400,
  color: "default",
};

export function getChainConfig(chain: string): ChainConfig {
  return CHAIN_CONFIG[chain] ?? DEFAULT_CHAIN_CONFIG;
}

export const KNOWN_CHAINS = Object.keys(CHAIN_CONFIG);

// Chain badge styles
export const CHAIN_BADGE_STYLES: Record<string, string> = {
  pilot: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  flyingj: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  loves: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  ta: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  petro: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  speedway: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  kwiktrip: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  default: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export function getChainBadgeStyle(chain: string): string {
  const config = CHAIN_CONFIG[chain];
  if (!config) return CHAIN_BADGE_STYLES.default;
  return CHAIN_BADGE_STYLES[config.color] ?? CHAIN_BADGE_STYLES.default;
}
