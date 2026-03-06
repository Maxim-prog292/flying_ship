import { BuildSelection, computeBuild } from '../domain/flight-calculator';

export interface ResultScreenModel {
  totalScore: number;
  resultTitle: string;
  resultDescription: string;
  metrics: Array<{ key: string; value: number }>;
  hints: string[];
}

export function getResultScreenModel(selection: BuildSelection): ResultScreenModel {
  const computation = computeBuild(selection);

  return {
    totalScore: computation.score,
    resultTitle: computation.result.title,
    resultDescription: computation.result.description,
    metrics: [
      { key: 'lift', value: computation.stats.lift },
      { key: 'magBalance', value: computation.stats.magBalance },
      { key: 'stability', value: computation.stats.stability },
      { key: 'range', value: computation.stats.range },
    ],
    hints: computation.hints.map((hint) => hint.text),
  };
}
