import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

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
  setHttpProgressStatus(inprogess: boolean) {
    this.httpLoading$.next(inprogess);
  }
}