import { loadGameConfig } from '../config/loaders';
import { BuildSelection, computeBuild } from '../domain/flight-calculator';

export interface BuildScreenModel {
  hullOptions: Array<{ id: string; title: string }>;
  powerOptions: Array<{ id: string; title: string }>;
  helperOptions: Array<{ id: string; title: string }>;
  trialOptions: Array<{ id: string; title: string }>;
}

export function getBuildScreenModel(): BuildScreenModel {
  const config = loadGameConfig();
  return {
    hullOptions: config.hulls.map(({ id, title }) => ({ id, title })),
    powerOptions: config.powers.map(({ id, title }) => ({ id, title })),
    helperOptions: config.helpers.map(({ id, title }) => ({ id, title })),
    trialOptions: config.trialEvents.map(({ id, title }) => ({ id, title })),
  };
}

export function previewBuild(selection: BuildSelection) {
  return computeBuild(selection);
}
