import type { LocalStats } from "../analytics/localStats";

export interface HiddenEntryOptions {
  tapsRequired?: number;
  tapWindowMs?: number;
  holdDurationMs?: number;
  onUnlocked: () => void;
}

export class HiddenAdminEntry {
  private readonly tapsRequired: number;
  private readonly tapWindowMs: number;
  private readonly holdDurationMs: number;
  private tapCounter = 0;
  private firstTapAt = 0;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: HiddenEntryOptions) {
    this.tapsRequired = options.tapsRequired ?? 7;
    this.tapWindowMs = options.tapWindowMs ?? 2500;
    this.holdDurationMs = options.holdDurationMs ?? 1500;
  }

  registerTap(timestamp = Date.now()): void {
    if (this.firstTapAt === 0 || timestamp - this.firstTapAt > this.tapWindowMs) {
      this.firstTapAt = timestamp;
      this.tapCounter = 0;
    }

    this.tapCounter += 1;
    if (this.tapCounter >= this.tapsRequired) {
      this.resetTapState();
      this.options.onUnlocked();
    }
  }

  onPointerDown(): void {
    this.clearHoldTimer();
    this.holdTimer = setTimeout(() => {
      this.options.onUnlocked();
      this.clearHoldTimer();
    }, this.holdDurationMs);
  }

  onPointerUp(): void {
    this.clearHoldTimer();
  }

  private clearHoldTimer(): void {
    if (!this.holdTimer) {
      return;
    }

    clearTimeout(this.holdTimer);
    this.holdTimer = null;
  }

  private resetTapState(): void {
    this.tapCounter = 0;
    this.firstTapAt = 0;
  }
}

export interface AdminSettings {
  mute: boolean;
  volume: number;
  inactivityResetMs: number;
}

export interface AdminControllerDependencies {
  stats: LocalStats;
  onForceScreenTransition: (screen: string) => void;
  onSettingsUpdated?: (settings: AdminSettings) => void;
  minVolume?: number;
  maxVolume?: number;
}

export class AdminController {
  private readonly minVolume: number;
  private readonly maxVolume: number;
  private settings: AdminSettings;

  constructor(private readonly deps: AdminControllerDependencies) {
    this.minVolume = deps.minVolume ?? 0;
    this.maxVolume = deps.maxVolume ?? 100;
    this.settings = {
      mute: false,
      volume: this.maxVolume,
      inactivityResetMs: 60_000,
    };
  }

  getSettings(): AdminSettings {
    return { ...this.settings };
  }

  setMute(mute: boolean): AdminSettings {
    this.settings.mute = mute;
    return this.publishSettings();
  }

  setVolume(volume: number): AdminSettings {
    this.settings.volume = Math.max(this.minVolume, Math.min(this.maxVolume, volume));
    if (this.settings.volume > 0 && this.settings.mute) {
      this.settings.mute = false;
    }
    return this.publishSettings();
  }

  setInactivityResetTimeout(timeoutMs: number): AdminSettings {
    this.settings.inactivityResetMs = Math.max(1_000, timeoutMs);
    return this.publishSettings();
  }

  forceTransition(screen: string): void {
    this.deps.onForceScreenTransition(screen);
  }

  async resetStats(): Promise<void> {
    await this.deps.stats.reset();
  }

  private publishSettings(): AdminSettings {
    const snapshot = this.getSettings();
    this.deps.onSettingsUpdated?.(snapshot);
    return snapshot;
  }
}
