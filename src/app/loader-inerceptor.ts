import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './services/loader-service.service';

/**
 * Loader interceptor
 */
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  /**
   * Counter
   */
  private count = 0;

  /**
   * Loader interceptor
   * @param loaderService 
   */
  constructor(private loaderService: LoaderService) { }

  /**
   * Intercept obeservable
   * @param req 
   * @param next 
   * @returns 
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.count === 0) {
      this.loaderService.setHttpProgressStatus(true);
    }
    this.count++;
    return next.handle(req).pipe(
      finalize(() => {
        this.count--;
        if (this.count === 0) {
          this.loaderService.setHttpProgressStatus(false);
        }
      }));
  }
}