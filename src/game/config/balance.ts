// R39 — Central balance configuration.
// ALL tunable game values live here. Game logic reads from this object and never
// hardcodes magic numbers, so the balance can be adjusted without touching logic.
// (In production this can be overridden from a DB table / remote config; the shape
// is the contract.)

export interface BalanceConfig {
  needs: {
    // Points lost per real hour (meters run 0..100, higher = better satisfied).
    hungerDecayPerHour: number;
    energyDecayPerHour: number;
    energyRecoveryPerHourSleeping: number;
    // A poop event drops cleanliness by this much; poops appear on this interval.
    cleanlinessDropPerPoop: number;
    hoursPerPoop: number;
    // Below these thresholds the monster is "in need" (drives notifications R35).
    hungerWarnThreshold: number;
    cleanlinessWarnThreshold: number;
    energyWarnThreshold: number;
  };
  lifespan: {
    baseHours: number; // base natural lifespan
    // Each care mistake (ignored need over a grace window) shortens life.
    hoursLostPerCareMistake: number;
    // Sustained good care grants longevity, capped.
    hoursGainedPerGoodCareDay: number;
    maxLongevityBonusHours: number;
    // Stages of aging as fraction of effective lifespan.
    elderFraction: number; // when monster is visibly "old"
  };
  training: {
    // Auto-resolved minigame: flat points, no skill needed.
    autoPoints: number;
    // Played minigame: scales with performance score 0..1 up to this max.
    maxPlayPoints: number;
    energyCostPerSession: number;
    hungerCostPerSession: number;
    // Soft cap per stat; gains taper as the stat approaches this.
    statSoftCap: number;
  };
  evolution: {
    // Care mistakes at or below this favor the "best" branches.
    cleanEvolutionMaxMistakes: number;
  };
  inheritance: {
    // Heir starts with this fraction of the deceased's final stats as a bonus...
    statBonusFraction: number;
    // ...accumulated across generations but never exceeding this absolute cap (per stat).
    maxAccumulatedBonusPerStat: number;
    // Number of techniques the heir inherits from the deceased.
    inheritedTechniqueCount: number;
  };
  combat: {
    maxRounds: number;
    baseDamage: number;
    // Damage = baseDamage * power/100 * (atk/def scaled) * typeMult * variance.
    attackDefenseScale: number;
    minVariance: number; // e.g. 0.85
    maxVariance: number; // e.g. 1.15
    // Status penalties (multipliers on effective stats).
    sickStatMultiplier: number;
    injuredStatMultiplier: number;
    fatiguedStatMultiplier: number;
  };
  rewards: {
    expWin: number;
    expLoss: number;
    pointsWin: number;
    pointsLoss: number;
  };
  ranking: {
    // Minimum battles fought before a player appears in the win% ranking (R33).
    minBattlesToRank: number;
  };
  ailments: {
    injuryChanceAfterBattle: number; // R27 low probability
    contagionChanceVsSickOpponent: number; // R28
    fatiguePerBattle: number;
    fatiguePerTrainingSession: number;
    fatigueRecoveryPerHourResting: number;
  };
  challenges: {
    expireAfterHours: number; // pending challenge TTL (edge case)
    maxPendingPerChallenger: number;
  };
}

export const DEFAULT_BALANCE: BalanceConfig = {
  needs: {
    hungerDecayPerHour: 8,
    energyDecayPerHour: 6,
    energyRecoveryPerHourSleeping: 20,
    cleanlinessDropPerPoop: 25,
    hoursPerPoop: 4,
    hungerWarnThreshold: 30,
    cleanlinessWarnThreshold: 30,
    energyWarnThreshold: 25,
  },
  lifespan: {
    baseHours: 24 * 12, // ~12 days
    hoursLostPerCareMistake: 6,
    hoursGainedPerGoodCareDay: 8,
    maxLongevityBonusHours: 24 * 8,
    elderFraction: 0.8,
  },
  training: {
    autoPoints: 2,
    maxPlayPoints: 6,
    energyCostPerSession: 12,
    hungerCostPerSession: 8,
    statSoftCap: 999,
  },
  evolution: {
    cleanEvolutionMaxMistakes: 3,
  },
  inheritance: {
    statBonusFraction: 0.05,
    maxAccumulatedBonusPerStat: 60,
    inheritedTechniqueCount: 1,
  },
  combat: {
    maxRounds: 30,
    baseDamage: 12,
    attackDefenseScale: 0.5,
    minVariance: 0.85,
    maxVariance: 1.15,
    sickStatMultiplier: 0.7,
    injuredStatMultiplier: 0.8,
    fatiguedStatMultiplier: 0.85,
  },
  rewards: {
    expWin: 30,
    expLoss: 10,
    pointsWin: 15,
    pointsLoss: 0,
  },
  ranking: {
    minBattlesToRank: 5,
  },
  ailments: {
    injuryChanceAfterBattle: 0.08,
    contagionChanceVsSickOpponent: 0.25,
    fatiguePerBattle: 15,
    fatiguePerTrainingSession: 10,
    fatigueRecoveryPerHourResting: 12,
  },
  challenges: {
    expireAfterHours: 48,
    maxPendingPerChallenger: 10,
  },
};
