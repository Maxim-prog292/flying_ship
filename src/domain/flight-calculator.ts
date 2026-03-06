import { loadGameConfig } from '../config/loaders';
import { BonusOrRisk, FlightParams, HintConfig, ResultBand } from '../config/types';

export interface BuildSelection {
  hullId: string;
  powerId: string;
  helperId: string;
  trialEventId?: string;
}

export interface BuildComputation {
  stats: FlightParams;
  score: number;
  bonuses: BonusOrRisk[];
  risks: BonusOrRisk[];
  result: ResultBand;
  hints: HintConfig[];
}

function addStats(base: FlightParams, delta: Partial<FlightParams>): FlightParams {
  return {
    lift: base.lift + (delta.lift ?? 0),
    magBalance: base.magBalance + (delta.magBalance ?? 0),
    stability: base.stability + (delta.stability ?? 0),
    range: base.range + (delta.range ?? 0),
  };
}

export function computeBuild(selection: BuildSelection): BuildComputation {
  const config = loadGameConfig();

  const hull = config.hulls.find((item) => item.id === selection.hullId);
  const power = config.powers.find((item) => item.id === selection.powerId);
  const helper = config.helpers.find((item) => item.id === selection.helperId);
  const trialEvent = selection.trialEventId
    ? config.trialEvents.find((item) => item.id === selection.trialEventId)
    : undefined;

  if (!hull || !power || !helper) {
    throw new Error('Build selection references unknown configuration ids.');
  }

  let stats = hull.base;
  stats = addStats(stats, power.modifiers);
  stats = addStats(stats, helper.modifiers);
  if (trialEvent) {
    stats = addStats(stats, trialEvent.modifiers);
  }

  const score = stats.lift + stats.magBalance + stats.stability + stats.range;
  const result =
    config.results.find((band) => score >= band.minScore && score <= band.maxScore) ??
    config.results[config.results.length - 1];

  const hints = config.hints.filter((hint) => {
    const subject = hint.trigger === 'overall' ? score : stats[hint.trigger];
    return hint.condition === 'low' ? subject <= hint.threshold : subject >= hint.threshold;
  });

  return {
    stats,
    score,
    result,
    hints,
    bonuses: [...hull.bonuses, ...power.bonuses, ...helper.bonuses],
    risks: [...hull.risks, ...power.risks, ...helper.risks],
  };
}
