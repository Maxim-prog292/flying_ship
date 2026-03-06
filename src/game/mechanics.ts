import type { ScreenState } from '../app/types';

const STATE_ORDER: ScreenState[] = ['attract', 'build', 'trial', 'result'];

export const nextStateFromTap = (state: ScreenState): ScreenState => {
  if (state === 'auto-reset') {
    return 'attract';
  }

  const currentIndex = STATE_ORDER.indexOf(state);
  if (currentIndex === -1) {
    return 'attract';
  }

  return STATE_ORDER[(currentIndex + 1) % STATE_ORDER.length] ?? 'attract';
};

export const shouldStartAutoReset = (state: ScreenState): boolean => state === 'result';
