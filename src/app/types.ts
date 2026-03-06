export type ScreenState = 'attract' | 'build' | 'trial' | 'result' | 'auto-reset';

export type ScreenContent = {
  title: string;
  description: string;
  actionLabel: string;
};

export type ScreenContentMap = Record<Exclude<ScreenState, 'auto-reset'>, ScreenContent>;
