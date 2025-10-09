import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NativeBridgeService } from './native-bridge.service';
import { DatePipe } from '@angular/common';
import { Buffer } from 'buffer';
import { Subject, Observable, retry, timestamp } from 'rxjs';
import { GenericService } from './generic.service';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';
import { Location } from '@angular/common';

declare var require: any;
(window as any).Buffer = Buffer;
@Injectable({
  providedIn: 'root'
})
export class MachineService {

  /** modal status subscriber */
  private openModal$ = new Subject();

  constructor(
    private apiSrv: ApiService,
    private bridge: NativeBridgeService,
    public datePipe: DatePipe,
    private gnrcSrv: GenericService,
    private localStorageSrv: LocalStorageService,
    private router: Router,
    private cacheSrv: CacheService,
    private location: Location
  ) {
    (window as any).handleNativeBack = () => {
      //console.log("🔙 Native back pressed");
      this.location.back(); // redirect to your chosen route
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

    let registerMachineId = objectToEncrypt.Machine || null
    let amount = objectToEncrypt.Ticket?.Stake || null
    let timeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS')
    objectToEncrypt = JSON.stringify(objectToEncrypt);
    const xxtea = require('xxtea-node');
    let encryptData: any;
    let machineData = await this.getMachineData();
    if (isRegisterMachineApi) {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.GetMachineDefaultKey(registerMachineId)));
    }
    else {

      if (!machineData) {
        console.warn("⚠️ No machineData found yet, retrying...");
        machineData = await this.getMachineData();
      }
      let encryptionPass = machineData?.CommunicationKey || 'default';
      //////console.log(`Encryption Pass ${encryptionPass}`)
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(encryptionPass));


    }


    const uint8Array = new Uint8Array(encryptData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64String = btoa(binaryString);

    const body: any = {
      machine: (isRegisterMachineApi) ? registerMachineId : machineData.MachineId.toString(),  //("3359")
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

    ////console.log(body)

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
    let machineSerial = await this.bridge.getSerial()
    if (isRegisterMachineApi) {
      decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(this.GetMachineDefaultKey(machineSerial))))
    }
    else {
      let machineData: any = await this.getMachineData()
      let encryptionPass = machineData?.CommunicationKey || 'default';
      decrypted = xxtea.toString(xxtea.decrypt(base64String, xxtea.toBytes(encryptionPass)));
    }
    return JSON.parse(decrypted);
  }

  async handleApiResponse(subRoute: any, apiRoute: any, method: any, params: any) {
    let userData = await this.getUserData()
    let machineData = await this.getMachineData();

    params = {
      ...params,
      PersonId: (userData) ? userData.PersonId : null,
      GameOperationId: machineData.OperationId,
      TimeStamp: this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS'),
      MachineId: machineData.MachineId,
    }
    console.log(params)
    const cacheKey = this.cacheSrv.generateCacheKey(subRoute, apiRoute, method, params);
    params = await this.encryptedRequest(params, (apiRoute === 'RegisterMachine') ? true : false);

    let apiResponse: any

    if (navigator.onLine) {
      // Save full API response exactly
      ////console.log(`${apiRoute} api route from navigator online`)
      apiResponse = await this.apiSrv.makeApi(subRoute, apiRoute, method, params, true)
      this.cacheSrv.saveToFlutterOfflineCache(cacheKey, apiResponse);
    }

    else {
      console.warn('⚡ Offline mode: loading from Flutter cache');
      apiResponse = await this.cacheSrv.getFromFlutterOfflineCache(cacheKey);
    }

    if (apiResponse?.encryptedResponse) {
      let decryptedResponse = await this.decrypt(apiResponse.encryptedResponse, (apiRoute === 'RegisterMachine') ? true : false)
      //console.log(decryptedResponse)
      if (Array.isArray(decryptedResponse)) {
        return {
          data: decryptedResponse,
          status: apiResponse.status,
          message: apiResponse.message
        };
      } else {
        return {
          ...decryptedResponse,
          status: apiResponse.status,
          message: apiResponse.message
        };
      }
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

  async getMachinePermission(permissionName: any, gameId: any = null) {
    let userData = await this.getUserData()
    // console.log(
    //   userData.UserSettings.map((usrSet: any) => {
    //     return { Name: usrSet.Name, SettingId: usrSet.SettingId, GameId: usrSet.GameId, ...usrSet }
    //   })
    // )

    let hasPermission = userData.UserSettings.find((setting: any) => (setting.Name == permissionName) && (setting.GameId == gameId))?.BitValue

    //console.log(permissionName + '  ' + hasPermission)
    return hasPermission
  }

  async registerMachine(params: any) {
    let apiResponse: any = await this.handleApiResponse('GameCooksAuth', 'RegisterMachine', 'POST', params)

    apiResponse.Games = apiResponse.Games.map((gameItem: any) => ({
      ...gameItem,
      RouteName: gameItem.GameApi.split('/')[1]
    }));

    this.cacheSrv.saveToFlutterOfflineCache('machine_data', apiResponse);
    this.localStorageSrv.setItem('machine_data', apiResponse, true)
    return apiResponse;
  }

  async getMachineData() {
    let machineData: any = await this.cacheSrv.getFromFlutterOfflineCache('machine_data')
    return machineData;
  }

  getGameRoute() {
    let route = this.router.url.split('/')[2]
    //console.log(this.router.url)
    return route
  }

  async getGameId() {
    let machineData: any = await this.getMachineData()
    let gameId = machineData.Games?.find((gameItem: any) => gameItem.RouteName === this.getGameRoute())?.GameId
    return gameId
  }

  async loginMachine(loginParams: any) {

    let apiResponse: any = await this.handleApiResponse('GameCooksAuth', 'LoginMachine', 'POST', loginParams)
    this.cacheSrv.saveToFlutterOfflineCache('user_data', apiResponse);
    this.localStorageSrv.setItem('user_data', apiResponse, true)
    return apiResponse;
  }


  async getUserData() {
    let machineData: any = await this.cacheSrv.getFromFlutterOfflineCache('user_data')
    return machineData;
  }

  async getGameEvents() {

    let params: any = {
      GameId: await this.getGameId(),
      GameConfiguration: [],
      UserOnlineStatus: true
    }

    let gameEventsResponse = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/GetEventConfiguration`, 'POST', params)
    return gameEventsResponse
  }

  async getFixedConfiguration(fixedConfigurationId: any) {

    let params: any = {
      GameId: await this.getGameId(),
      GameConfiguration: [],
      UserOnlineStatus: true,
      FixedConfigurationId: fixedConfigurationId
    }
    let gameEventsResponse1 = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/GetFixedConfiguration`, 'POST', params)
    return gameEventsResponse1.FixedConfiguration.FixedEventConfiguration
  }

  async issueTicket(ticketObject: any) {
    let userData = await this.getUserData()
    let machineData = await this.getMachineData();
    ////console.log(userData)

    let date = new Date()
    let ticketRequestId = Math.floor(Math.random() * 1e12).toString() + this.gnrcSrv.getFormattedToday() + 28
    ticketRequestId = ("00000000000000000000000000000000000" + ticketRequestId).substring(ticketRequestId.length);

    let ticketBody = {
      GameId: await this.getGameId(),
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
      GameId: await this.getGameId(),
      Ticket: ticketBody,
      TicketRequestId: ticketRequestId,
      LoyalityReferenceId: 0,
    }

    try {
      const apiResponse = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/IssueTicket`, 'POST', params)
      ////console.log(apiResponse)
      if (apiResponse.DataToPrint) {
        this.bridge.sendPrintMessage('normalText', apiResponse.DataToPrint, apiResponse.Sender, apiResponse.FullTicketId);
        return apiResponse
      }
      else if (apiResponse.status == false) {
        this.setModalData(true, false, apiResponse.message)
        return apiResponse
      }
      ////console.log(apiResponse)
    } catch (error) {
      ////console.log(error)
    }
  }


  async validateTicket(fullTicketId: any) {

    let params: any = {
      FullTicketId: fullTicketId,
    }

    let validateTicketResponse = await this.handleApiResponse(`CommonAPI`, `CommonAPI/ValidateTicket`, 'POST', params)
    //console.log(validateTicketResponse)

    if (validateTicketResponse.status == false) {
      this.setModalData(true, false, validateTicketResponse.message)
    }

    else if (validateTicketResponse.dataToPrint) {
      validateTicketResponse.dataToPrint = validateTicketResponse.dataToPrint.replace(/;/g, "\n");
    }
    return validateTicketResponse
  }

  async getReports(reportsParams: any, shouldPrint = false) {

    let reportsResponse: any;
    if (reportsParams.GameEventId) {
      reportsResponse = await this.handleApiResponse(`${reportsParams.apiRoute}`, `${reportsParams.apiRoute}/EventResult`, 'POST', reportsParams)
    }
    else {
      reportsResponse = await this.handleApiResponse(`Master`, `MachineReport/MachineReport`, 'POST', reportsParams)
    }

    if (reportsResponse.status == false) {
      this.setModalData(true, false, reportsResponse.message)
    }

    if (shouldPrint) {
      this.bridge.sendPrintMessage('normalText', reportsResponse.DataToPrint, reportsResponse.Sender);
    }
    return reportsResponse
  }

  async payTicket(fullTicketId: any) {
    let params: any = {
      FullTicketId: fullTicketId,
    }
    let payTicketResponse = await this.handleApiResponse(`CommonAPI`, `CommonAPI/PayTicket`, 'POST', params)

    if (payTicketResponse.status == false) {
      this.setModalData(true, false, payTicketResponse.message)
    }
    else if (payTicketResponse.DataToPrint) {
      this.bridge.sendPrintMessage('normalText', payTicketResponse.DataToPrint, payTicketResponse.Sender, payTicketResponse.FullTicketId);
    }
    return payTicketResponse
  }

  async cancelTicket(params: any) {

    let cancelTicketResponse = await this.handleApiResponse(`CommonAPI`, `CommonAPI/FlagToCancelTicket`, 'POST', params)
    //console.log(cancelTicketResponse)
    if (cancelTicketResponse) {
      this.setModalData(true, cancelTicketResponse.status, cancelTicketResponse.message)
    }
    return cancelTicketResponse
  }


  /************SB APIS START************/
  async getFiltersLists() {
    let params = {
      Language: 'en',
    }
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetFiltersLists?language=en`, 'POST', params)
    return apiResponse
  }

  async getMatches(apiParams: any) {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetMatchListByName`, 'POST', apiParams)
    console.log(apiResponse)
    if (apiResponse.status == false) {
      this.setModalData(true, apiResponse.status, apiResponse.message)
    }
    return apiResponse.data
  }

  async getOutcomesListByMatchId(apiParams: any) {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetOutcomesListByMatchId`, 'POST', apiParams)
    console.log(apiResponse)
    return apiResponse.data
  }

  async getOutcomesListByMatchCode(apiParams: any) {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetOutcomesListByEventCode`, 'POST', apiParams)
    //console.log(apiResponse)
    return apiResponse.data
  }

  async getBonusRules() {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetBonusRules`, 'POST', {})
    //console.log(apiResponse)
    return apiResponse
  }

  async issueSBTicket(ticketObject: any) {
    let userData = await this.getUserData()
    let machineData = await this.getMachineData();
    let gameId = await this.getGameId()

    ticketObject.GameId = gameId
    ticketObject.MachineDateIssued = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS')
    console.log(ticketObject)

    let ticketRequestId = machineData.MachineId.toString() + machineData.MachineId.toString() + userData.PersonId.toString() + this.gnrcSrv.getFormattedToday() + gameId
    ticketRequestId = ("00000000000000000000000000000000000" + ticketRequestId).substring(ticketRequestId.length);

    let params = {
      GameId: gameId,
      Ticket: ticketObject,
      TicketRequestId: ticketRequestId,
      LoyalityReferenceId: 0,
    }

    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/IssueTicket`, 'POST', params)
    if (apiResponse.status == false) {
      this.setModalData(true, false, apiResponse.message)
    }
    else if (apiResponse.DataToPrint) {
      this.bridge.sendPrintMessage('normalText', apiResponse.DataToPrint, apiResponse.Sender, apiResponse.FullTicketId);
    }
    return apiResponse
  }

  /************SB APIS END************/
}
