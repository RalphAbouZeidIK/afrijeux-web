import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, timer } from 'rxjs';

/**
 * Service to show/hide the loader
 */
@Injectable({
  providedIn: 'root'
})

/**
   * Service to show loader on each API call
   */
export class LoaderService {
  /**
   * Service to show loader on each API call
   */
  private httpLoading$ = new ReplaySubject<boolean>(1);

  /**
   * Timestamp when loader was last shown
   */
  private loaderShownTime: number = 0;

  /**
   * Minimum time to show loader in milliseconds
   */
  private readonly MIN_LOADER_TIME = 1000;

  /**
   * Service to show loader on each API call
   */
  constructor() { }

  /**
   * Observable to log the progress
   * @returns 
   */
  httpProgress(): Observable<boolean> {
    return this.httpLoading$.asObservable();
  }

  /**
   * Pass the loading status
   * @returns 
   */
  setHttpProgressStatus(inprogress: boolean) {
    if (inprogress) {
      // Show loader immediately
      this.loaderShownTime = Date.now();
      this.httpLoading$.next(true);
    } else {
      // Check if minimum time has passed
      const elapsedTime = Date.now() - this.loaderShownTime;
      const remainingTime = this.MIN_LOADER_TIME - elapsedTime;

      if (remainingTime > 0) {
        // Delay hiding the loader
        timer(remainingTime).subscribe(() => {
          this.httpLoading$.next(false);
        });
      } else {
        // Hide immediately
        this.httpLoading$.next(false);
      }
    }
  }
}