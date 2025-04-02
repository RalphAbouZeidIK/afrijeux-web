import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { firstValueFrom } from 'rxjs';
declare var require: any;
import { XMLParser } from 'fast-xml-parser';

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

  constructor(private http: HttpClient, private router: Router, private userSrv: UserService) { }

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
      alert('Unauthorized');
      if (this.router.url !== '/') {
        this.userSrv.signOut();
        this.router.navigate(['']);
      }
      setTimeout(() => {
        this.errorHandled = false;
      }, 5000);
    } else {
      console.warn('API Error:', error);
    }
  }

  /**
   * Main API call function
   * @param subRoute Sub route URL
   * @param apiRoute Main API route
   * @param method API method (GET, POST, etc.)
   * @param params API parameters
   * @param noTimeout Disable timeout
   */
  async makeApi(
    subRoute: string,
    apiRoute: string,
    method: string,
    params: any,
    isNormalApi: boolean = false
  ): Promise<any> {
    if (this.userSrv.sessionExpired()) {
      this.userSrv.signOut();
      this.router.navigate(['']);
      return;
    }

    if (!isNormalApi) {
      params = this.encryptedRequest(params)
    }


    const subRouteUrl = this.getSubRouteUrl(subRoute);
    const apiEndPoint = `${environment.BaseUrl}${environment.gcSrv}${subRouteUrl}${apiRoute}`;


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

  /**
   * GET API with blob response type
   * @param url API endpoint
   * @param paramsObject Query parameters
   * @param responseType Response type
   * @param observe Observe type
   */
  async get(url: string, paramsObject = {}, responseType: any = 'blob', observe: any = 'body'): Promise<any> {
    let headers = new HttpHeaders();
    if (this.userSrv.getUserToken()) {
      headers = headers.append('Authorization', `Bearer ${this.userSrv.getUserToken()}`);
    }

    const response = this.http.get(url, { headers, params: paramsObject, responseType, observe });

    try {
      return await firstValueFrom(response);
    } catch (error) {
      this.handleError(error);
      throw error;
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
   * Fetches data from the API and converts XML response to JSON
   */
  async betradarapi(route: string, method: string, params: ApiParams = {}) {
    if (this.userSrv.sessionExpired()) {
      this.userSrv.signOut();
      this.router.navigate(['/admin']);
      return;
    }

    const apiEndPoint = route;
    const paramsBody = params.body || {}; // For POST, PUT, PATCH
    let headers = new HttpHeaders();
    headers = headers.append('x-access-token', `t7Iu5mWuLFbYjP5uPg`);

    const httpOptions = { headers };

    let response: Observable<any>;

    // Switch case for different HTTP methods
    switch (method) {
      case 'POST':
        response = this.http
          .post(apiEndPoint, paramsBody, { ...httpOptions, responseType: 'text' }) // Request as 'text' to receive XML as text
          .pipe(timeout(30000));
        break;
      case 'PUT':
        response = this.http
          .put(apiEndPoint, paramsBody, { ...httpOptions, responseType: 'text' }) // Request as 'text' to receive XML as text
          .pipe(timeout(30000));
        break;
      case 'PATCH':
        response = this.http
          .patch(apiEndPoint, paramsBody, { ...httpOptions, responseType: 'text' }) // Request as 'text' to receive XML as text
          .pipe(timeout(30000));
        break;
      case 'DELETE':
        response = this.http
          .delete(apiEndPoint, { ...httpOptions, responseType: 'text' }) // Request as 'text' to receive XML as text
          .pipe(timeout(30000));
        break;
      case 'GET':
      default:
        response = this.http
          .get(apiEndPoint, { ...httpOptions, responseType: 'text' }) // Request as 'text' to receive XML as text
          .pipe(timeout(30000));
        break;
    }

    // Return the response as a Promise after converting XML to JSON
    const xmlResponse = await response.toPromise();
    return this.convertXmlToJson(xmlResponse); // Convert XML to JSON
  }

  /**
   * Converts XML string to JSON using xml2js
   */
  private convertXmlToJson(xmlString: string): Promise<any> {
    const parser = new XMLParser({
      ignoreAttributes: false,   // Don't ignore attributes
      trimValues: true,          // Trim values to avoid unnecessary spaces
      attributeNamePrefix: "",   // Remove the default '@' for attributes
      alwaysCreateTextNode: true, // Ensure text nodes are always created
      // Optional: If you're dealing with CDATA
    });
    return parser.parse(xmlString);

  }

  async oddsapi(route: string, method: string, params: ApiParams = {}) {
    if (this.userSrv.sessionExpired()) {
      this.userSrv.signOut();
      this.router.navigate(['/admin']);
      return;
    }

    // Assuming the route passed is relative to /oddscomparison-prematch
    const apiEndPoint = `https://try.readme.io/https://api.sportradar.com/${route}`;
    const paramsBody = params.body || {}; // For POST, PUT, PATCH
    let headers = new HttpHeaders();
    headers = headers.append('x-access-token', `t7Iu5mWuLFbYjP5uPg`);

    const httpOptions = { headers };

    console.log('API endpoint:', apiEndPoint);  // Debugging line to check the full URL being requested

    let response: Observable<any>;

    // Switch case for different HTTP methods
    switch (method) {
      case 'POST':
        response = this.http
          .post(apiEndPoint, paramsBody, httpOptions)  // For POST requests, pass body data
          .pipe(timeout(30000));
        break;
      case 'PUT':
        response = this.http
          .put(apiEndPoint, paramsBody, httpOptions)
          .pipe(timeout(30000));
        break;
      case 'PATCH':
        response = this.http
          .patch(apiEndPoint, paramsBody, httpOptions)
          .pipe(timeout(30000));
        break;
      case 'DELETE':
        response = this.http
          .delete(apiEndPoint, httpOptions)
          .pipe(timeout(30000));
        break;
      case 'GET':
      default:
        response = this.http
          .get(apiEndPoint, httpOptions)
          .pipe(timeout(30000));
        break;
    }

    // Return the response as a Promise after converting XML to JSON
    return await response.toPromise();
  }


}


/**
 * Params interface
 */
interface ApiParams {
  query?: any[]; // Query parameters
  body?: any; // Body parameters
}
