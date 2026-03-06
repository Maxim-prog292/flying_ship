import hullsData from './data/hulls.json';
import powersData from './data/powers.json';
import helpersData from './data/helpers.json';
import trialEventsData from './data/trial-events.json';
import resultsData from './data/results.json';
import hintsData from './data/hints.json';
import {
  BonusOrRisk,
  FlightParams,
  GameConfig,
  HelperConfig,
  HintConfig,
  HullConfig,
  PowerConfig,
  ResultBand,
  TrialEventConfig,
} from './types';

const metricKeys: Array<keyof FlightParams> = ['lift', 'magBalance', 'stability', 'range'];

function assertObject(value: unknown, name: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
}

function assertNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${name} must be a number`);
  }
}

function parseModifiers(value: unknown, name: string): Partial<FlightParams> {
  assertObject(value, name);
  const result: Partial<FlightParams> = {};

  for (const key of Object.keys(value)) {
    if (!metricKeys.includes(key as keyof FlightParams)) {
      throw new Error(`${name} has unsupported modifier key: ${key}`);
    }

    const raw = value[key];
    assertNumber(raw, `${name}.${key}`);
    result[key as keyof FlightParams] = raw;
  }

  return result;
}

function parseFlightParams(value: unknown, name: string): FlightParams {
  assertObject(value, name);

  const parsed: Partial<FlightParams> = {};
  for (const key of metricKeys) {
    assertNumber(value[key], `${name}.${key}`);
    parsed[key] = value[key] as number;
  }

  return parsed as FlightParams;
}

function parseBonusOrRisk(value: unknown, name: string): BonusOrRisk {
  assertObject(value, name);
  assertString(value.key, `${name}.key`);
  assertString(value.description, `${name}.description`);
  return {
    key: value.key,
    description: value.description,
    modifiers: parseModifiers(value.modifiers, `${name}.modifiers`),
  };
}

function parseList<T>(data: unknown, name: string, parser: (item: unknown, name: string) => T): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`${name} must be an array`);
  }
  return data.map((item, index) => parser(item, `${name}[${index}]`));
}

function parseHull(value: unknown, name: string): HullConfig {
  assertObject(value, name);
  assertString(value.id, `${name}.id`);
  assertString(value.title, `${name}.title`);
  return {
    id: value.id,
    title: value.title,
    base: parseFlightParams(value.base, `${name}.base`),
    bonuses: parseList(value.bonuses, `${name}.bonuses`, parseBonusOrRisk),
    risks: parseList(value.risks, `${name}.risks`, parseBonusOrRisk),
  };
}

function parsePower(value: unknown, name: string): PowerConfig {
  assertObject(value, name);
  assertString(value.id, `${name}.id`);
  assertString(value.title, `${name}.title`);
  return {
    id: value.id,
    title: value.title,
    modifiers: parseModifiers(value.modifiers, `${name}.modifiers`),
    bonuses: parseList(value.bonuses, `${name}.bonuses`, parseBonusOrRisk),
    risks: parseList(value.risks, `${name}.risks`, parseBonusOrRisk),
  };
}

function parseHelper(value: unknown, name: string): HelperConfig {
  assertObject(value, name);
  assertString(value.id, `${name}.id`);
  assertString(value.title, `${name}.title`);
  return {
    id: value.id,
    title: value.title,
    modifiers: parseModifiers(value.modifiers, `${name}.modifiers`),
    bonuses: parseList(value.bonuses, `${name}.bonuses`, parseBonusOrRisk),
    risks: parseList(value.risks, `${name}.risks`, parseBonusOrRisk),
  };
}

function parseTrialEvent(value: unknown, name: string): TrialEventConfig {
  assertObject(value, name);
  assertString(value.id, `${name}.id`);
  assertString(value.title, `${name}.title`);
  assertString(value.risk, `${name}.risk`);
  return {
    id: value.id,
    title: value.title,
    modifiers: parseModifiers(value.modifiers, `${name}.modifiers`),
    risk: value.risk,
  };
}

function parseResultBand(value: unknown, name: string): ResultBand {
  assertObject(value, name);
  assertString(value.id, `${name}.id`);
  assertString(value.title, `${name}.title`);
  assertString(value.description, `${name}.description`);
  assertNumber(value.minScore, `${name}.minScore`);
  assertNumber(value.maxScore, `${name}.maxScore`);

  return {
    id: value.id,
    minScore: value.minScore,
    maxScore: value.maxScore,
    title: value.title,
    description: value.description,
  };
}

function parseHint(value: unknown, name: string): HintConfig {
  assertObject(value, name);
  assertString(value.id, `${name}.id`);
  assertString(value.text, `${name}.text`);
  assertNumber(value.threshold, `${name}.threshold`);

  const trigger = value.trigger;
  const condition = value.condition;

  if (trigger !== 'overall' && !metricKeys.includes(trigger as keyof FlightParams)) {
    throw new Error(`${name}.trigger has invalid value`);
  }

  if (condition !== 'low' && condition !== 'high') {
    throw new Error(`${name}.condition has invalid value`);
  }

  return {
    id: value.id,
    trigger,
    condition,
    threshold: value.threshold,
    text: value.text,
  };
}

export function loadGameConfig(): GameConfig {
  return {
    hulls: parseList(hullsData, 'hulls', parseHull),
    powers: parseList(powersData, 'powers', parsePower),
    helpers: parseList(helpersData, 'helpers', parseHelper),
    trialEvents: parseList(trialEventsData, 'trialEvents', parseTrialEvent),
    results: parseList(resultsData, 'results', parseResultBand),
    hints: parseList(hintsData, 'hints', parseHint),
  };
}
