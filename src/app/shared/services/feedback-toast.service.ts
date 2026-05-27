import { Injectable, signal } from '@angular/core';

/**
 * This service stores the toast message and whether it is open.
 * Any component can inject it and call showSuccess() or showError().
 */
@Injectable({
  providedIn: 'root',
})
export class FeedbackToastService {
  /** The text shown inside the toast box. */
  message = signal('');

  /** When true, the toast gets the red error border. */
  isError = signal(false);

  /** When true, the overlay exists in the HTML (backdrop + toast). */
  isOpen = signal(false);

  /** When true, the toast panel is slid in (used for CSS animation). */
  panelVisible = signal(false);

  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Shows the default success toast (cream background, no red border).
   * @param message Text for the user, for example "Your survey is now published".
   * @param autoHideMs After how many milliseconds the toast closes itself. Default: 5 seconds.
   */
  showSuccess(message: string, autoHideMs = 5000): void {
    this.openToast(message, false, autoHideMs);
  }

  /**
   * Shows the error toast (same look, but with a red border).
   * Error toasts stay open until the user closes them or clicks the backdrop.
   */
  showError(message: string): void {
    this.openToast(message, true, 0);
  }

  /**
   * Starts the slide-out animation and removes the overlay from the page.
   */
  hide(): void {
    this.clearTimers();
    this.panelVisible.set(false);

    this.closeTimer = setTimeout(() => {
      this.isOpen.set(false);
      this.message.set('');
      this.isError.set(false);
    }, 320);
  }

  /**
   * Shared logic for success and error.
   * Sets the message, opens the overlay, and optionally starts a timer to auto-close.
   */
  private openToast(message: string, isError: boolean, autoHideMs: number): void {
    this.clearTimers();

    this.message.set(message);
    this.isError.set(isError);
    this.isOpen.set(true);

    // Wait one animation frame so the browser can play the slide-in transition.
    requestAnimationFrame(() => {
      this.panelVisible.set(true);
    });

    if (autoHideMs > 0) {
      this.autoHideTimer = setTimeout(() => this.hide(), autoHideMs);
    }
  }

  /** Clears pending timers so they do not fire after a new toast opens. */
  private clearTimers(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
