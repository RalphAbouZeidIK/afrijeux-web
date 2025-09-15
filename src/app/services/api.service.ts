


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

(window as any).Buffer = Buffer;
declare var require: any;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private errorHandled: boolean = false;

  machineId = 'B42M001K02400065';
  encryptionPass = 'dAQ1Rj/cbIQ=';

  constructor(
    private http: HttpClient,
    private router: Router,
    private userSrv: UserService,
    private translate: TranslateService,
    public datePipe: DatePipe
  ) {
    (window as any).onCacheLoaded = (key: string, cachedValue: any) => {
      if (this.cacheCallbacks[key]) {
        this.cacheCallbacks[key](cachedValue);
        delete this.cacheCallbacks[key]; // cleanup
      }
    };
  }

  private handleError(error: any) {
    if (this.errorHandled) return;
    this.errorHandled = true;

    if (error.status === 401 || error.status === 403) {
      this.translate.get('alerts.unauthorized').subscribe((msg: string) => {
        alert(msg);
      });
      if (this.router.url !== '/') {
        this.userSrv.signOut();
        this.router.navigate(['']);
      }
      setTimeout(() => (this.errorHandled = false), 5000);
    } else {
      console.warn('API Error:', error);
    }
  }

  private generateCacheKey(subRoute: string, apiRoute: string, params: any, method: string) {
    const canonicalParams = this.canonicalizeParams(params);
    return `${method}:${subRoute}/${apiRoute}:${JSON.stringify(canonicalParams)}`;
  }

  private canonicalizeParams(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(v => this.canonicalizeParams(v));
    if (typeof obj === 'object') {
      const sorted: any = {};
      Object.keys(obj)
        .sort()
        .forEach(k => {
          if (obj[k] !== undefined) {
            sorted[k] = this.canonicalizeParams(obj[k]);
          }
        });
      return sorted;
    }
    // convert numbers to string consistently if needed
    return obj;
  }


  /** Recursively sort object properties alphabetically */
  private sortObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((v) => this.sortObject(v));

    return Object.keys(obj)
      .sort()
      .reduce((res, key) => {
        res[key] = this.sortObject(obj[key]);
        return res;
      }, {} as any);
  }


  private saveToFlutterOfflineCache(key: string, data: any) {
    try {
      if ((window as any).OfflineCache) {
        const message = {
          action: 'save',
          key: key,
          value: JSON.stringify(data) // send raw API response as JSON string
        };
        (window as any).OfflineCache.postMessage(JSON.stringify(message));
        console.log('✅ Sent data to Flutter OfflineCache:', key);
      } else {
        console.warn('⚠️ OfflineCache channel not found');
      }
    } catch (err) {
      console.error('❌ Error sending to OfflineCache', err);
    }
  }

  private cacheCallbacks: Record<string, (value: any) => void> = {};

  private async getFromFlutterOfflineCache(key: string): Promise<any | null> {
    return new Promise((resolve) => {
      // Store the callback by cache key
      this.cacheCallbacks[key] = (cachedValue: any) => {
        resolve(cachedValue ? JSON.parse(cachedValue) : null);
        delete this.cacheCallbacks[key]; // cleanup
      };

      if ((window as any).OfflineCache) {
        (window as any).OfflineCache.postMessage(
          JSON.stringify({ action: 'get', key })
        );
      } else {
        console.warn('⚠️ OfflineCache channel not found');
        resolve(null);
      }
    });
  }

  public GetMachineDefaultKey(MachineSerial: string): string {
    const FirstStatKey = "Q1W2E3R4T5Y6U7I8O9P0A1S2D3F4G5H6J7K8L9Z0X1C2V3B4N5M6";
    let key = "";

    // In JS/TS, use split('') instead of toCharArray()
    const serialList = MachineSerial.split('');
    const firstStatList = FirstStatKey.split('');

    for (let i = 0; i < serialList.length; i++) {
      key += firstStatList[i] + serialList[i];
    }

    // In JS/TS, string has .length property, not length()
    key = (key.length > 6) ? key.substring(0, 6) : key;
    console.log("Machine Default Key: " + key);
    return key;

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

    if (!isNormalApi) {
      params = this.encryptedRequest(params, (apiRoute === 'RegisterMachine') ? true : false);
      console.log(params);
    }

    const apiEndPoint = `${environment.BaseUrl}${environment.gcSrv}${subRoute}/${apiRoute}`;
    console.log(apiEndPoint);

    let headers = new HttpHeaders();
    if (this.userSrv.getUserToken()) {
      headers = headers.append('Authorization', `Bearer ${this.userSrv.getUserToken()}`);
    }

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

    const cacheKey = this.generateCacheKey(subRoute, apiRoute, params, method);
    console.log('Cache key:', cacheKey);

    try {
      if (navigator.onLine) {
        const apiResponse = await firstValueFrom(response);

        // Save full API response exactly
        this.saveToFlutterOfflineCache(cacheKey, apiResponse);

        return apiResponse;
      } else {
        console.warn('⚡ Offline mode: loading from Flutter cache');
        const cachedData = await this.getFromFlutterOfflineCache(cacheKey);
        console.log('CACHED DATA HERE:', cachedData);
        if (cachedData) return cachedData; // already parsed to JS object
        throw new Error('No cached data available');
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }

  }

  encryptedRequest(objectToEncrypt: any, isRegisterMachineApi: boolean = false) {
    let timeStamp = this.datePipe.transform(new Date(), 'MM/dd/yyyy HH:mm:ss')
    console.log(objectToEncrypt)
    objectToEncrypt = JSON.stringify(objectToEncrypt);
    const xxtea = require('xxtea-node');
    let encryptData: any;
    if (isRegisterMachineApi) {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.GetMachineDefaultKey(this.machineId)));
    }
    else {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.encryptionPass));
    }


    const uint8Array = new Uint8Array(encryptData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64String = btoa(binaryString);

    return {
      body: {
        machine: this.machineId,
        timeStamp: timeStamp,
        encryptedRequestDTO: base64String,
        geolocation: {
          latitude: "0",
          longitude: "0",
          timeStamp: timeStamp
        },
        ip: null,
        culture: null,
        machineCode: null,
        currency: null,
        amount: null
      },
    };
  }

  decrypt(base64String: any) {
    const xxtea = require('xxtea-node');
    const decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(this.encryptionPass)));
    return JSON.parse(decrypted);
  }
}
