import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Buffer } from 'buffer';
import { TranslateService } from '@ngx-translate/core';
(window as any).Buffer = Buffer;
declare var require: any;

/**
 * Main API service
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private errorHandled: boolean = false;

  machineId = '2338'

  encryptionPass = 'dAQ1Rj/cbIQ='

  constructor(
    private http: HttpClient,
    private router: Router,
    private userSrv: UserService,
    private translate: TranslateService,
  ) { }

  /**
   * Handle API errors
   * @param error Error response
   */
  private handleError(error: any) {
    if (this.errorHandled) {
      return;
    }
    this.errorHandled = true;

    if (error.status === 401 || error.status === 403) {
      // this.translate.get('alerts.unauthorized').subscribe((translatedMsg: string) => {
      //   alert(translatedMsg);
      // });
      // if (this.router.url !== '/') {
      //   this.userSrv.signOut();
      //   this.router.navigate(['']);
      // }
      setTimeout(() => {
        this.errorHandled = false;
      }, 5000);
    } else {
      console.warn('API Error:', error);
    }
  }

  /**
   * Main API call function
   * @param controllerName Sub route URL
   * @param apiRoute Main API route
   * @param method API method (GET, POST, etc.)
   * @param params API parameters
   * @param isNormalApi for normal API calls
   */
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
      params = this.encryptedRequest(params)
      console.log(params)
    }

    const apiEndPoint = `${environment.BaseUrl}${environment.gcSrv}${subRoute}/${apiRoute}`;
    console.log(apiEndPoint)

    let headers = new HttpHeaders();

    /**
 * Adding the bearer if logged in
 */
    if (this.userSrv.getUserToken()) {
      headers = headers.append('Authorization', `Bearer ${this.userSrv.getUserToken()}`); // Header Authorization Bearer
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

    try {
      if (isNormalApi) {
        return firstValueFrom(response)
      }
      else {
        let encryptedResponse = await firstValueFrom(response);
        console.log(encryptedResponse);
        let decryptedResponse = (encryptedResponse.encryptedResponse) ? await this.decrypt(encryptedResponse.encryptedResponse) : encryptedResponse
        decryptedResponse.status = encryptedResponse.status
        decryptedResponse.message = encryptedResponse.message
        return decryptedResponse
      }

    } catch (error) {
      this.handleError(error);
      throw error; // Rethrow for further handling if needed
    }
  }


  encryptedRequest(objectToEncrypt: any) {
    objectToEncrypt = JSON.stringify(objectToEncrypt)
    var xxtea = require('xxtea-node');
    var pass = this.encryptionPass;
    var encrypt_data = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(pass));

    const uint8Array = new Uint8Array(encrypt_data);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    // Now encode to Base64

    const base64String = btoa(binaryString);


    //const ciphertext = CryptoJS.AES.encrypt(objectToEncrypt, pass).toString();

    let params = {
      body: {
        "machine": this.machineId,
        "timeStamp": "string",
        "encryptedRequestDTO": base64String,
        "geolocation": {
          "latitude": "string",
          "longitude": "string",
          "timeStamp": "string"
        },
        "ip": "10.1.3.254"
      }
    }

    return params

  }

  decrypt(base64String: any) {
    var xxtea = require('xxtea-node');
    var pass = 'dAQ1Rj/cbIQ=';

    var decrypt_data = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(pass)));
    return JSON.parse(decrypt_data);
  }

  /**
   * Helper to get sub-route URL
   * @param subRoute Sub-route key
   */
  private getSubRouteUrl(subRoute: string): string {
    switch (subRoute) {
      case 'auth':
        return environment.subUrls.auth;
      case 'master':
        return environment.subUrls.master;
      case 'AfrijeuxPariMutuelUrbain':
        return environment.subUrls.pmu;
      default:
        return `${subRoute}/`;
    }
  }

}


/**
 * Params interface
 */
interface ApiParams {
  query?: any[]; // Query parameters
  body?: any; // Body parameters
}
