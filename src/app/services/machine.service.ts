import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NativeBridgeService } from './native-bridge.service';
import { DatePipe } from '@angular/common';
import { Buffer } from 'buffer';
import { Subject, Observable } from 'rxjs';

declare var require: any;
(window as any).Buffer = Buffer;
@Injectable({
  providedIn: 'root'
})
export class MachineService {

  machineId: any;
  machineData: any;
  encryptionPass: any = '';
  userData: any;
  /** modal status subscriber */
  private openModal$ = new Subject();

  constructor(
    private apiSrv: ApiService,
    private bridge: NativeBridgeService,
    public datePipe: DatePipe
  ) {
    (window as any).onCacheLoaded = (key: string, cachedValue: any) => {
      if (this.cacheCallbacks[key]) {
        this.cacheCallbacks[key](cachedValue);
        delete this.cacheCallbacks[key]; // cleanup
      }
    };
  }


  setModalData(openModal: boolean, success: boolean, messageCode: string) {
    let modalStatus = {
      openModal: openModal,
      success: success,
      msgCode: messageCode
    }
    this.setModalStatus(modalStatus)
  }

  getModalStatus(): Observable<any> {
    return this.openModal$;
  }

  setModalStatus(status: any) {
    this.openModal$.next(status);
  }

  async encryptedRequest(objectToEncrypt: any, isRegisterMachineApi: boolean = false) {
    let timeStamp = this.datePipe.transform(new Date(), 'MM/dd/yyyy HH:mm:ss')
    console.log(objectToEncrypt)
    objectToEncrypt = JSON.stringify(objectToEncrypt);
    const xxtea = require('xxtea-node');
    let machineData: any
    let encryptData: any;
    if (isRegisterMachineApi) {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.GetMachineDefaultKey(this.machineId)));
    }
    else {
      machineData = await this.getFromFlutterOfflineCache('machine_data')
      let encryptionPass = machineData?.CommunicationKey
      console.log(`Encryption Pass ${encryptionPass}`)
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(encryptionPass));
    }


    const uint8Array = new Uint8Array(encryptData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64String = btoa(binaryString);
    console.log({
      body: {
        machine: (isRegisterMachineApi) ? this.machineId : machineData?.MachineId,
        timeStamp: timeStamp,
        encryptedRequestDTO: base64String,
        geolocation: {
          latitude: "0",
          longitude: "0",
          timeStamp: timeStamp
        },
        ip: null,
        culture: null,
        machineCode: (isRegisterMachineApi) ? null : machineData?.MachineCode,
        currency: null,
        amount: null
      },
    })
    return {
      body: {
        machine: (isRegisterMachineApi) ? this.machineId : machineData?.MachineId.toString(),
        timeStamp: timeStamp,
        encryptedRequestDTO: base64String,
        geolocation: {
          latitude: "0",
          longitude: "0",
          timeStamp: timeStamp
        },
        ip: null,
        culture: null,
        machineCode: (isRegisterMachineApi) ? null : machineData?.MachineCode,
        currency: null,
        amount: null
      },
    };

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

  async decrypt(base64String: any, isRegisterMachineApi: boolean = false) {
    const xxtea = require('xxtea-node');
    let decrypted: any;
    if (isRegisterMachineApi) {
      decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(this.GetMachineDefaultKey(this.machineId))))
      this.encryptionPass = JSON.parse(decrypted).CommunicationKey;
      console.log(`Encryption Pass ${this.encryptionPass}`)
    }
    else {
      let machineData: any = await this.getFromFlutterOfflineCache('machine_data')
      let encryptionPass = machineData?.CommunicationKey
      console.log(`Encryption Pass ${this.encryptionPass}`)
      console.log(this.encryptionPass)
      decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(encryptionPass)));
    }
    return JSON.parse(decrypted);
  }

  private saveToFlutterOfflineCache(key: string, data: any) {
    console.log(data)
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

  private generateCacheKey(subRoute: string, apiRoute: string, method: string, params: any) {
    const normalizedParams = { ...params };
    delete normalizedParams.TimeStamp; // remove volatile field(s)

    console.log('Normalized params:', normalizedParams);
    return `${method}:${subRoute}/${apiRoute}/${JSON.stringify(normalizedParams)}`;
  }

  private cacheCallbacks: Record<string, (value: any) => void> = {};

  async getFromFlutterOfflineCache(key: string): Promise<any | null> {
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

  async clearFlutterOfflineCache(): Promise<void> {

    return new Promise((resolve) => {
      if ((window as any).OfflineCache) {
        (window as any).OfflineCache.postMessage(
          JSON.stringify({ action: 'clear' })
        );
        resolve();
      } else {
        console.warn('⚠️ OfflineCache channel not found');
        resolve();
      }
    });
  }

  async handleApiResponse(subRoute: any, apiRoute: any, method: any, params: any) {
    const cacheKey = this.generateCacheKey(subRoute, apiRoute, method, params);
    params = await this.encryptedRequest(params, (apiRoute === 'RegisterMachine') ? true : false);
    console.log('Cache key here:', cacheKey);

    let apiResponse: any

    if (navigator.onLine) {
      // Save full API response exactly
      apiResponse = await this.apiSrv.makeApi(subRoute, apiRoute, method, params, true)
      this.saveToFlutterOfflineCache(cacheKey, apiResponse);
    }

    else {
      console.warn('⚡ Offline mode: loading from Flutter cache');
      apiResponse = await this.getFromFlutterOfflineCache(cacheKey);
    }

    if (apiResponse?.encryptedResponse) {
      apiResponse = await this.decrypt(apiResponse.encryptedResponse, (apiRoute === 'RegisterMachine') ? true : false)
      return apiResponse;
    }

    else {
      return { status: false, message: 'No internet connection and no cached data available.' };
    }
  }

  async registerMachine() {
    this.machineId = await this.bridge.getSerial()
    let params: any = {
      "Machine": this.machineId,
      "VersionCode": '1.0.0',
      "TimeStamp": new Date().toISOString()
    }

    let apiResponse: any = await this.handleApiResponse('GameCooksAuth', 'RegisterMachine', 'POST', params)
    this.saveToFlutterOfflineCache('machine_data', apiResponse);
    this.machineData = await this.getFromFlutterOfflineCache('machine_data')
    return apiResponse;
  }

  async loginMachine(loginParams: any) {

    const params = {
      "UserName": loginParams.UserName,
      "Password": loginParams.Password,
      "Ip": loginParams.Ip,
      "MachineId": this.machineData?.MachineId,
      "GameOperationId": this.machineData?.OperationId,
      "TimeStamp": new Date().toISOString()
    }

    console.log(params)
    let apiResponse: any = await this.handleApiResponse('GameCooksAuth', 'LoginMachine', 'POST', params)
    this.userData = apiResponse
    this.saveToFlutterOfflineCache('user_data', apiResponse);
    console.log(apiResponse)
    return apiResponse;
  }

  // async getGame() {
  //   let apiRespnse = await this.gnrcSrv.getGame('HPBPMU')
  //   this.gameObject = apiRespnse
  //   return apiRespnse
  // }

  async getGameEvents() {
    //let gameObject = await this.getGame()
    let userData = await this.getFromFlutterOfflineCache('user_data')
    let params: any = {
      PersonId: userData.PersonId,
      GameId: 28,
      GameConfiguration: [],
      TimeStamp: new Date().toISOString(),
      UserOnlineStatus: true
    }

    let gameEventsResponse = await this.handleApiResponse(`PMUHybrid`, `PMUHybrid/GetEventConfiguration`, 'POST', params)
    return gameEventsResponse
  }

  async getFixedConfiguration(fixedConfigurationId: any) {
    let userData = await this.getFromFlutterOfflineCache('user_data')

    let params: any = {
      PersonId: userData.PersonId,
      GameId: 28,
      GameConfiguration: [],
      TimeStamp: new Date().toISOString(),
      UserOnlineStatus: true,
      FixedConfigurationId: fixedConfigurationId
    }
    let gameEventsResponse1 = await this.handleApiResponse(`PMUHybrid`, `PMUHybrid/GetFixedConfiguration`, 'POST', params)
    return gameEventsResponse1.FixedConfiguration.FixedEventConfiguration
  }

}
