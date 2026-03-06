export interface FlightParams {
  lift: number;
  magBalance: number;
  stability: number;
  range: number;
}

export interface BonusOrRisk {
  key: string;
  description: string;
  modifiers: Partial<FlightParams>;
}

export interface HullConfig {
  id: string;
  title: string;
  base: FlightParams;
  bonuses: BonusOrRisk[];
  risks: BonusOrRisk[];
}

export interface PowerConfig {
  id: string;
  title: string;
  modifiers: Partial<FlightParams>;
  bonuses: BonusOrRisk[];
  risks: BonusOrRisk[];
}

export interface HelperConfig {
  id: string;
  title: string;
  modifiers: Partial<FlightParams>;
  bonuses: BonusOrRisk[];
  risks: BonusOrRisk[];
}

export interface TrialEventConfig {
  id: string;
  title: string;
  modifiers: Partial<FlightParams>;
  risk: string;
}

export interface ResultBand {
  id: string;
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
}

export interface HintConfig {
  id: string;
  trigger: keyof FlightParams | 'overall';
  condition: 'low' | 'high';
  threshold: number;
  text: string;
}

export interface GameConfig {
  hulls: HullConfig[];
  powers: PowerConfig[];
  helpers: HelperConfig[];
  trialEvents: TrialEventConfig[];
  results: ResultBand[];
  hints: HintConfig[];
}
