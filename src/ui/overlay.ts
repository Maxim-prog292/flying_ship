import type { ScreenContentMap, ScreenState } from '../app/types';

export class OverlayUI {
  private readonly layer: HTMLDivElement;
  private readonly title: HTMLHeadingElement;
  private readonly description: HTMLParagraphElement;
  private readonly button: HTMLButtonElement;
  private readonly chip: HTMLParagraphElement;

  constructor(container: HTMLElement, private readonly content: ScreenContentMap, onTap: () => void) {
    this.layer = document.createElement('div');
    this.layer.className = 'overlay-layer';

    const card = document.createElement('section');
    card.className = 'overlay-card';

    this.title = document.createElement('h1');
    this.title.className = 'state-title';

    this.description = document.createElement('p');
    this.description.className = 'state-description';

    this.button = document.createElement('button');
    this.button.className = 'touch-cta';
    this.button.addEventListener('pointerup', onTap);

    this.chip = document.createElement('p');
    this.chip.className = 'status-chip';

    card.append(this.title, this.description, this.button);
    this.layer.append(card, this.chip);
    container.append(this.layer);
  }

  public update(state: ScreenState): void {
    if (state === 'auto-reset') {
      this.title.textContent = 'Авто-сброс';
      this.description.textContent = 'Сессия завершена. Подготовка к возврату в attract-режим…';
      this.button.textContent = 'Ожидание';
      this.button.disabled = true;
      this.chip.textContent = 'AUTO RESET';
      return;
    }

    const screen = this.content[state];
    this.title.textContent = screen.title;
    this.description.textContent = screen.description;
    this.button.textContent = screen.actionLabel;
    this.button.disabled = false;
    this.chip.textContent = state.toUpperCase();
  }

  public destroy(): void {
    this.layer.remove();
  }
}
