export type AppScreenState = "idle" | "configuring" | "running" | "result" | "transition";

export interface WatchdogOptions {
  inactivityResetMs: number;
  intermediateStateTimeoutMs: number;
  intermediateStates?: AppScreenState[];
  onReset: (reason: "inactivity" | "stuck") => void;
}

export class Watchdog {
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private intermediateTimer: ReturnType<typeof setTimeout> | null = null;
  private currentState: AppScreenState = "idle";
  private readonly intermediateStates: Set<AppScreenState>;

  constructor(private readonly options: WatchdogOptions) {
    this.intermediateStates = new Set(
      options.intermediateStates ?? ["configuring", "transition"],
    );
  }

  start(): void {
    this.touch();
    this.setState(this.currentState);
  }

  stop(): void {
    this.clearInactivityTimer();
    this.clearIntermediateTimer();
  }

  touch(): void {
    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      this.options.onReset("inactivity");
      this.touch();
    }, this.options.inactivityResetMs);
  }

  setState(state: AppScreenState): void {
    this.currentState = state;
    this.clearIntermediateTimer();

    if (!this.intermediateStates.has(state)) {
      return;
    }

    this.intermediateTimer = setTimeout(() => {
      this.options.onReset("stuck");
      this.setState("idle");
      this.touch();
    }, this.options.intermediateStateTimeoutMs);
  }

  updateInactivityTimeout(timeoutMs: number): void {
    this.options.inactivityResetMs = timeoutMs;
    this.touch();
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private clearIntermediateTimer(): void {
    if (this.intermediateTimer) {
      clearTimeout(this.intermediateTimer);
      this.intermediateTimer = null;
    }
  }
}
