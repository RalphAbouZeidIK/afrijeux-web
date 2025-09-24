import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NativeBridgeService } from './native-bridge.service';
import { DatePipe } from '@angular/common';
import { Buffer } from 'buffer';
import { Subject, Observable, retry } from 'rxjs';
import { GenericService } from './generic.service';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';

declare var require: any;
(window as any).Buffer = Buffer;
@Injectable({
  providedIn: 'root'
})
export class MachineService {

  machineId: any;
  machineData: any;
  encryptionPass: any = '';  //(TDUT9J6gTig=)
  userData: any;


  /** modal status subscriber */
  private openModal$ = new Subject();

  constructor(
    private apiSrv: ApiService,
    private bridge: NativeBridgeService,
    public datePipe: DatePipe,
    private gnrcSrv: GenericService,
    private localStorageSrv: LocalStorageService,
    private router: Router,
    private cacheSrv: CacheService
  ) {
    (window as any).handleNativeBack = () => {
      console.log("🔙 Native back pressed");
      this.router.navigate(['Machine/Home']); // redirect to your chosen route
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
    ////console.log(objectToEncrypt)
    let amount = objectToEncrypt.Ticket?.Stake || null
    let timeStamp = this.datePipe.transform(new Date(), 'MM/dd/yyyy HH:mm:ss')
    objectToEncrypt = JSON.stringify(objectToEncrypt);
    const xxtea = require('xxtea-node');
    let encryptData: any;
    let machineData = await this.getMachineData();
    if (isRegisterMachineApi) {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.GetMachineDefaultKey(this.machineId)));
    }
    else {

      if (!machineData) {
        console.warn("⚠️ No machineData found yet, retrying...");
        machineData = await this.getMachineData();
      }
      let encryptionPass = machineData?.CommunicationKey || 'default';
      ////console.log(`Encryption Pass ${encryptionPass}`)
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(encryptionPass));


    }


    const uint8Array = new Uint8Array(encryptData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64String = btoa(binaryString);

    const body: any = {
      machine: (isRegisterMachineApi) ? this.machineId : machineData.MachineId.toString(),  //("3359")
      timeStamp: timeStamp,
      encryptedRequestDTO: base64String,
      geolocation: {
        latitude: "0",
        longitude: "0",
        timeStamp: timeStamp
      },
      ip: null,
      culture: null,
      machineCode: (isRegisterMachineApi) ? null : machineData.MachineCode,   //("6821")
      currency: null,
      amount: amount
    }

    console.log(body)

    return {
      body
    }
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
    return key;

  }

  async decrypt(base64String: any, isRegisterMachineApi: boolean = false) {
    const xxtea = require('xxtea-node');
    let decrypted: any;
    if (isRegisterMachineApi) {
      decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(this.GetMachineDefaultKey(this.machineId))))
      this.encryptionPass = JSON.parse(decrypted).CommunicationKey;
    }
    else {
      let machineData: any = await this.getMachineData()
      let encryptionPass = machineData?.CommunicationKey || 'default';
      ////console.log(`Encryption Pass ${this.encryptionPass}`)
      ////console.log(this.encryptionPass)
      decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(encryptionPass)));
    }
    return JSON.parse(decrypted);
  }

  async handleApiResponse(subRoute: any, apiRoute: any, method: any, params: any) {
    console.log(params)
    const cacheKey = this.cacheSrv.generateCacheKey(subRoute, apiRoute, method, params);
    params = await this.encryptedRequest(params, (apiRoute === 'RegisterMachine') ? true : false);

    let apiResponse: any

    if (navigator.onLine) {
      // Save full API response exactly
      //console.log(`${apiRoute} api route from navigator online`)
      apiResponse = await this.apiSrv.makeApi(subRoute, apiRoute, method, params, true)
      this.cacheSrv.saveToFlutterOfflineCache(cacheKey, apiResponse);
    }

    else {
      console.warn('⚡ Offline mode: loading from Flutter cache');
      apiResponse = await this.cacheSrv.getFromFlutterOfflineCache(cacheKey);
    }

    if (apiResponse?.encryptedResponse) {
      apiResponse = await this.decrypt(apiResponse.encryptedResponse, (apiRoute === 'RegisterMachine') ? true : false)
      return apiResponse;
    }

    else {
      if (apiResponse?.encryptedResponse === null) {
        return { status: false, message: apiResponse.message };
      }
      else {
        return { status: false, message: 'No internet connection and no cached data available.' };
      }
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
    this.cacheSrv.saveToFlutterOfflineCache('machine_data', apiResponse);
    this.localStorageSrv.setItem('machine_data', apiResponse, true)
    this.machineData = await this.getMachineData()
    return apiResponse;
  }

  async getMachineData() {
    let machineData: any = await this.cacheSrv.getFromFlutterOfflineCache('machine_data')
    return machineData;
  }

  async getGameId(routerName: any) {
    console.log(routerName)
    let machineData: any = await this.getMachineData()
    console.log(machineData)
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

    let apiResponse: any = await this.handleApiResponse('GameCooksAuth', 'LoginMachine', 'POST', params)
    console.log(apiResponse)
    this.userData = apiResponse
    this.cacheSrv.saveToFlutterOfflineCache('user_data', apiResponse);
    this.localStorageSrv.setItem('user_data', this.userData, true)
    return apiResponse;
  }


  async getUserData() {
    let machineData: any = await this.cacheSrv.getFromFlutterOfflineCache('user_data')
    return machineData;
  }

  async getGameEvents() {
    //let gameObject = await this.getGame()
    let userData = await this.getUserData()
    //this.getGameId(location.pathname.split('/'))
    //console.log(userData)
    let params: any = {
      PersonId: userData.PersonId,  //(9791)
      GameId: 28,
      GameConfiguration: [],
      TimeStamp: new Date().toISOString(),
      UserOnlineStatus: true
    }

    let gameEventsResponse = await this.handleApiResponse(`PMUHybrid`, `PMUHybrid/GetEventConfiguration`, 'POST', params)
    return gameEventsResponse
  }

  async getFixedConfiguration(fixedConfigurationId: any) {
    let userData = await this.getUserData()
    //console.log(userData)

    let params: any = {
      PersonId: userData.PersonId,  //(9791)
      GameId: 28,
      GameConfiguration: [],
      TimeStamp: new Date().toISOString(),
      UserOnlineStatus: true,
      FixedConfigurationId: fixedConfigurationId
    }
    let gameEventsResponse1 = await this.handleApiResponse(`PMUHybrid`, `PMUHybrid/GetFixedConfiguration`, 'POST', params)
    return gameEventsResponse1.FixedConfiguration.FixedEventConfiguration
  }

  async issueTicket(ticketObject: any) {
    let userData = await this.getUserData()
    let machineData = await this.getMachineData();
    //console.log(userData)

    let date = new Date()
    let ticketRequestId = Math.floor(Math.random() * 1e12).toString() + this.gnrcSrv.getFormattedToday() + 28
    ticketRequestId = ("00000000000000000000000000000000000" + ticketRequestId).substring(ticketRequestId.length);

    let ticketBody = {
      GameId: 28,
      FullTicketId: '',
      EncryptedTicketKey: '',
      IsVoucher: 0,
      Stake: ticketObject.TicketPrice,
      MachineId: machineData.MachineId,
      PersonId: userData.PersonId,
      MachineTicketId: 0,
      MachineDateIssued: date.toISOString(),
      ServiceDateIssued: date.toISOString(),
      TicketRequestId: ticketRequestId,
      GamePick: ticketObject,
      LoyalityReferenceId: 0,
      ReferenceId: '',
      IsPromotion: false,
      PromotionRuleId: 0,
    }

    let params = {
      GameId: 28,
      PersonId: userData.PersonId,
      MachineId: machineData.MachineId,
      Ticket: ticketBody,
      TicketRequestId: ticketRequestId,
      LoyalityReferenceId: 0,
      TimeStamp: 'string',
    }


    // let params = {
    //   body: {
    //     "timeStamp": "string",
    //     "issueTicketRequest": issueTicketRequest,
    //     "ip": "10.1.3.254",
    //     "culture": "en",
    //     "currency": 4,
    //     "amount": ticketBody.Stake
    //   }
    // }
    //console.log(params)


    try {
      const apiResponse = await this.handleApiResponse(`PMUHybrid`, `PMUHybrid/IssueTicket`, 'POST', params)
      //console.log(apiResponse)
      if (apiResponse.DataToPrint) {
        this.bridge.sendPrintMessage('normalText', apiResponse.DataToPrint);
        return apiResponse
      }
      //console.log(apiResponse)
    } catch (error) {
      //console.log(error)
    }
  }


  async validateTicket(fullTicketId: any) {
    let userData = await this.getUserData()
    let params: any = {
      PersonId: userData.PersonId,  //(9791)
      MachineId: 28,
      FullTicketId: fullTicketId,
      TimeStamp: new Date().toISOString()
    }

    let validateTicketResponse = await this.handleApiResponse(`CommonAPI`, `CommonAPI/ValidateTicket`, 'POST', params)
    return validateTicketResponse
  }

}
