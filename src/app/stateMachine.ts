import screensRaw from '../config/screens.json';
import { nextStateFromTap, shouldStartAutoReset } from '../game/mechanics';
import { FlyingScene } from '../scene/scene3d';
import { OverlayUI } from '../ui/overlay';
import type { ScreenContentMap, ScreenState } from './types';

const AUTO_RESET_DELAY_MS = 3000;

export const createAppStateMachine = (root: HTMLElement) => {
  const shell = document.createElement('div');
  shell.className = 'kiosk-shell';

  const sceneLayer = document.createElement('div');
  sceneLayer.className = 'scene-layer';

  shell.append(sceneLayer);
  root.append(shell);

  const content = screensRaw as ScreenContentMap;
  const scene = new FlyingScene(sceneLayer);
  const overlay = new OverlayUI(shell, content, onTap);

  let state: ScreenState = 'attract';
  let rafId = 0;
  let autoResetTimer: number | undefined;

  function renderLoop(): void {
    scene.render(state);
    overlay.update(state);
    rafId = window.requestAnimationFrame(renderLoop);
  }

  function clearAutoReset(): void {
    if (autoResetTimer !== undefined) {
      window.clearTimeout(autoResetTimer);
      autoResetTimer = undefined;
    }
  }

  function scheduleAutoReset(): void {
    clearAutoReset();
    state = 'auto-reset';
    autoResetTimer = window.setTimeout(() => {
      state = 'attract';
      autoResetTimer = undefined;
    }, AUTO_RESET_DELAY_MS);
  }

  function onTap(): void {
    clearAutoReset();
    const next = nextStateFromTap(state);
    state = next;

    if (shouldStartAutoReset(next)) {
      window.setTimeout(() => {
        scheduleAutoReset();
      }, 1200);
    }
  }

  return {
    start(): void {
      renderLoop();
    },
    stop(): void {
      clearAutoReset();
      window.cancelAnimationFrame(rafId);
      overlay.destroy();
      scene.destroy();
      shell.remove();
    },
  };
};
