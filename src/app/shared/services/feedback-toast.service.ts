import { Injectable, signal } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class FeedbackToastService {

  message = signal('');
  isError = signal(false);
  isOpen = signal(false);
  panelVisible = signal(false);
  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;


  /**
   * Shows a success message toast.
   * @param message The message to display
   * @param autoHideMs Time in milliseconds before auto-hiding
   */
  showSuccess(message: string, autoHideMs = 4000): void {
    this.openToast(message, false, autoHideMs);
  }

  /**
   * Shows an error message toast.
   * @param message The error message to display
   */
  showError(message: string): void {
    this.openToast(message, true, 0);
  }

  /**
   * Hides the toast message.
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
   * Opens a toast notification with the given settings.
   * @param message The message to display
   * @param isError Whether this is an error message
   * @param autoHideMs Time in milliseconds before auto-hiding
   */
  private openToast(message: string, isError: boolean, autoHideMs: number): void {
    this.clearTimers();
    this.message.set(message);
    this.isError.set(isError);
    this.isOpen.set(true);
    requestAnimationFrame(() => {
      this.panelVisible.set(true);
    });

    if (autoHideMs > 0) {
      this.autoHideTimer = setTimeout(() => this.hide(), autoHideMs);
    }
  }

  /**
   * Clears all active timers.
   */
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
