


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { environment } from 'src/environments/environment';
import { Buffer } from 'buffer';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { NativeBridgeService } from './native-bridge.service';
import { CacheService } from './cache.service';

(window as any).Buffer = Buffer;
declare var require: any;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private errorHandled: boolean = false;

  machineId: any = '';
  encryptionPass = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private userSrv: UserService,
    private translate: TranslateService,
    public datePipe: DatePipe,
    private cacheSrv: CacheService
  ) {

  }

  private async handleError(error: any) {
    if (this.errorHandled) return;
    this.errorHandled = true;

    if (error.status === 401 || error.status === 403) {
      this.translate.get('alerts.unauthorized').subscribe((msg: string) => {
        alert(msg);
      });

      if (window.location.href.includes('Machine')) {
        await this.cacheSrv.removeFromFlutterOfflineCache("user_data");
        this.router.navigate(['/Machine']);
      }

      else {
        if (this.router.url !== '/') {
          this.userSrv.signOut();
          this.router.navigate(['']);
        }
      }

      setTimeout(() => (this.errorHandled = false), 5000);
    } else {
      console.warn('API Error:', error);
    }
  }


  async makeApi(
    subRoute: string,
    apiRoute: string,
    method: string,
    params: any,
    isNormalApi: boolean = true,
  ): Promise<any> {
    if (this.userSrv.sessionExpired()) {
      this.userSrv.signOut();
      this.router.navigate(['']);
      return;
    }

    //////console.log(`${apiRoute} api route from make api` )
    const apiEndPoint = `${environment.BaseUrl}${environment.gcSrv}${subRoute}/${apiRoute}`;
    //////console.log(apiEndPoint);

    let headers = new HttpHeaders();

    let token = await this.userSrv.getUserToken()

    headers = headers.append('Authorization', `Bearer ${token}`);


    const httpOptions = { headers, params: params.query || {} };
    let response: Observable<any>;

    switch (method) {
      case 'GET':
        response = this.http.get(apiEndPoint, httpOptions).pipe(timeout(30000));
        break;
      default:
        response = this.http.post(apiEndPoint, params.body || {}, httpOptions).pipe(timeout(30000));
        break;
    }


    try {
      let apiResponse = await firstValueFrom(response);
      return apiResponse;
    } catch (error) {
      this.handleError(error);
      throw error;
    }

  }


}
