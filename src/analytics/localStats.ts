export type SessionOutcome = "success" | "partial" | "failure";

export interface SessionRecord {
  startedAt: number;
  endedAt: number;
  durationMs: number;
  outcome: SessionOutcome;
  configurationKey?: string;
}

export interface LocalStatsData {
  sessionsTotal: number;
  totalDurationMs: number;
  sessionsByOutcome: Record<SessionOutcome, number>;
  configurationFrequency: Record<string, number>;
  lastSessionStartedAt?: number;
  lastUpdatedAt: number;
}

export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export class BrowserLocalStorageAdapter implements StorageAdapter {
  async read(key: string): Promise<string | null> {
    return globalThis.localStorage.getItem(key);
  }

  async write(key: string, value: string): Promise<void> {
    globalThis.localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    globalThis.localStorage.removeItem(key);
  }
}

export class JsonFileStorageAdapter implements StorageAdapter {
  constructor(private readonly filePath: string) {}

  async read(_key: string): Promise<string | null> {
    try {
      const fs = await import("node:fs/promises");
      return await fs.readFile(this.filePath, "utf-8");
    } catch {
      return null;
    }
  }

  async write(_key: string, value: string): Promise<void> {
    const fs = await import("node:fs/promises");
    await fs.mkdir((await import("node:path")).dirname(this.filePath), {
      recursive: true,
    });
    await fs.writeFile(this.filePath, value, "utf-8");
  }

  async remove(_key: string): Promise<void> {
    const fs = await import("node:fs/promises");
    await fs.rm(this.filePath, { force: true });
  }
}

const DEFAULT_KEY = "flying_ship.local_stats";

function now(): number {
  return Date.now();
}

function initialData(): LocalStatsData {
  return {
    sessionsTotal: 0,
    totalDurationMs: 0,
    sessionsByOutcome: {
      success: 0,
      partial: 0,
      failure: 0,
    },
    configurationFrequency: {},
    lastUpdatedAt: now(),
  };
}

export interface StatsReport {
  sessionsTotal: number;
  averageDurationMs: number;
  totalDurationMs: number;
  configurationFrequency: Record<string, number>;
  outcomesShare: Record<SessionOutcome, number>;
}

export class LocalStats {
  private readonly key: string;
  private cache: LocalStatsData | null = null;

  constructor(private readonly adapter: StorageAdapter, storageKey = DEFAULT_KEY) {
    this.key = storageKey;
  }

  static createDefault(opts?: { jsonFilePath?: string; storageKey?: string }): LocalStats {
    const hasLocalStorage =
      typeof globalThis !== "undefined" &&
      "localStorage" in globalThis &&
      !!globalThis.localStorage;

    if (hasLocalStorage) {
      return new LocalStats(
        new BrowserLocalStorageAdapter(),
        opts?.storageKey ?? DEFAULT_KEY,
      );
    }

    if (opts?.jsonFilePath) {
      return new LocalStats(
        new JsonFileStorageAdapter(opts.jsonFilePath),
        opts.storageKey ?? DEFAULT_KEY,
      );
    }

    return new LocalStats(new InMemoryStorageAdapter(), opts?.storageKey ?? DEFAULT_KEY);
  }

  async load(): Promise<LocalStatsData> {
    if (this.cache) {
      return this.cache;
    }

    const raw = await this.adapter.read(this.key);
    if (!raw) {
      this.cache = initialData();
      return this.cache;
    }

    try {
      const parsed = JSON.parse(raw) as LocalStatsData;
      this.cache = {
        ...initialData(),
        ...parsed,
        sessionsByOutcome: {
          ...initialData().sessionsByOutcome,
          ...(parsed.sessionsByOutcome ?? {}),
        },
        configurationFrequency: parsed.configurationFrequency ?? {},
      };
    } catch {
      this.cache = initialData();
    }

    return this.cache;
  }

  async save(data: LocalStatsData): Promise<void> {
    data.lastUpdatedAt = now();
    this.cache = data;
    await this.adapter.write(this.key, JSON.stringify(data));
  }

  async reset(): Promise<void> {
    this.cache = initialData();
    await this.adapter.remove(this.key);
  }

  async recordSessionStart(startedAt = now()): Promise<void> {
    const data = await this.load();
    data.lastSessionStartedAt = startedAt;
    await this.save(data);
  }

  async recordConfiguration(configurationKey: string): Promise<void> {
    const data = await this.load();
    data.configurationFrequency[configurationKey] =
      (data.configurationFrequency[configurationKey] ?? 0) + 1;
    await this.save(data);
  }

  async recordSessionEnd(params: {
    outcome: SessionOutcome;
    endedAt?: number;
    configurationKey?: string;
  }): Promise<SessionRecord> {
    const data = await this.load();
    const endedAt = params.endedAt ?? now();
    const startedAt = data.lastSessionStartedAt ?? endedAt;
    const durationMs = Math.max(0, endedAt - startedAt);

    data.sessionsTotal += 1;
    data.totalDurationMs += durationMs;
    data.sessionsByOutcome[params.outcome] += 1;

    if (params.configurationKey) {
      data.configurationFrequency[params.configurationKey] =
        (data.configurationFrequency[params.configurationKey] ?? 0) + 1;
    }

    delete data.lastSessionStartedAt;
    await this.save(data);

    return {
      startedAt,
      endedAt,
      durationMs,
      outcome: params.outcome,
      configurationKey: params.configurationKey,
    };
  }

  async getReport(): Promise<StatsReport> {
    const data = await this.load();
    const total = Math.max(1, data.sessionsTotal);

    return {
      sessionsTotal: data.sessionsTotal,
      totalDurationMs: data.totalDurationMs,
      averageDurationMs:
        data.sessionsTotal === 0 ? 0 : Math.round(data.totalDurationMs / data.sessionsTotal),
      configurationFrequency: { ...data.configurationFrequency },
      outcomesShare: {
        success: data.sessionsByOutcome.success / total,
        partial: data.sessionsByOutcome.partial / total,
        failure: data.sessionsByOutcome.failure / total,
      },
    };
  }
}

export class InMemoryStorageAdapter implements StorageAdapter {
  private readonly map = new Map<string, string>();

  async read(key: string): Promise<string | null> {
    return this.map.get(key) ?? null;
  }

  async write(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }
}
