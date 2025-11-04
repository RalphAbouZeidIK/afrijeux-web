import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NativeBridgeService } from './native-bridge.service';
import { DatePipe } from '@angular/common';
import { Buffer } from 'buffer';
import { Subject, Observable, retry, timestamp, max, filter } from 'rxjs';
import { GenericService } from './generic.service';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

declare var require: any;
(window as any).Buffer = Buffer;
@Injectable({
  providedIn: 'root'
})
export class MachineService {

  /** modal status subscriber */
  private openModal$ = new Subject();

  isOnline = navigator.onLine

  gameEventsList: any

  encryptionKey: string = 'G@meC0oks@2023'

  valuesToPrint: any = {
    firstValue: '',
    secondValue: '',
    thirdValue: ''
  }


  constructor(
    private apiSrv: ApiService,
    private bridge: NativeBridgeService,
    public datePipe: DatePipe,
    private gnrcSrv: GenericService,
    private localStorageSrv: LocalStorageService,
    private router: Router,
    private cacheSrv: CacheService,
    private location: Location,
    private translate: TranslateService
  ) {
    (window as any).handleNativeBack = () => {
      ////console.log("🔙 Native back pressed");
      this.location.back(); // redirect to your chosen route
    };

    this.bridge.printerStatusSource.subscribe((error) => {
      console.log("⚠️ can print:", error);
      console.log(this.valuesToPrint)
      this.valuesToPrint.thirdValue.Ticket.IsPrinted = error ? 1 : 0
      this.valuesToPrint.thirdValue.Ticket.Printed = error ? 1 : 0

      this.cacheSrv.saveTicketToDb(this.valuesToPrint.firstValue, this.valuesToPrint.secondValue, this.valuesToPrint.thirdValue);
      // Example: save to DB or update UI
    });
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

  async encryptedRequest(objectToEncrypt: any, isRegisterMachineApi: boolean = false, isSyncApi: boolean = false) {

    let registerMachineId = objectToEncrypt.Machine || null
    let amount = objectToEncrypt.Ticket?.Stake || null
    let timeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS')
    //console.log(objectToEncrypt)
    objectToEncrypt = JSON.stringify(objectToEncrypt);
    const xxtea = require('xxtea-node');
    let encryptData: any;
    let machineData = await this.getMachineData();

    if (isRegisterMachineApi) {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.GetMachineDefaultKey(registerMachineId)));
    }

    else if (isSyncApi) {
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(this.encryptionKey));
    }

    else {

      if (!machineData) {
        console.warn("⚠️ No machineData found yet, retrying...");
        machineData = await this.getMachineData();
      }
      let encryptionPass = machineData?.CommunicationKey || 'default';
      ////////console.log(`Encryption Pass ${encryptionPass}`)
      encryptData = xxtea.encrypt(xxtea.toBytes(objectToEncrypt), xxtea.toBytes(encryptionPass));


    }


    const uint8Array = new Uint8Array(encryptData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64String = btoa(binaryString);
    //console.log('Base64 Encoded String:', base64String);
    const body: any = {
      machine: (isRegisterMachineApi) ? registerMachineId : machineData.MachineId.toString(),  //("3359")
      timeStamp: timeStamp,
      EncryptedRequestDTO: base64String,
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

    //console.log(body)

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
      GameOperationId: (machineData) ? machineData.OperationId : null,
      TimeStamp: this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS'),
      MachineId: (machineData) ? machineData.MachineId : null
    }
    let paramsBeforeEncryption = params
    //console.log(params)
    const cacheKey = this.cacheSrv.generateCacheKey(subRoute, apiRoute, method, params);
    params = await this.encryptedRequest(params, (apiRoute === 'RegisterMachine') ? true : false, (apiRoute.includes('ProcessTickets')) ? true : false);

    let apiResponse: any

    if (navigator.onLine) {
      // Save full API response exactly
      //////console.log(`${apiRoute} api route from navigator online`)
      apiResponse = await this.apiSrv.makeApi(subRoute, apiRoute, method, params, true)
      if ((subRoute == 'PMUHybrid' || subRoute == 'GameCooksAuth') && (!apiRoute.includes('IssueTicket'))) {
        this.cacheSrv.saveToFlutterOfflineCache(cacheKey, apiResponse);
      }

    }

    else {
      console.warn('⚡ Offline mode: loading from Flutter cache');
      //console.log(apiRoute)
      if ((subRoute == 'PMUHybrid' || subRoute == 'GameCooksAuth')) {
        apiResponse = await this.cacheSrv.getFromFlutterOfflineCache(cacheKey);
      }

    }

    if (!this.isOnline && apiRoute.includes('IssueTicket')) {
      //console.log(paramsBeforeEncryption.Ticket)
      this.valuesToPrint.firstValue = paramsBeforeEncryption.Ticket
      this.valuesToPrint.secondValue = params.body
      this.valuesToPrint.thirdValue = paramsBeforeEncryption
    }


    else if (apiResponse?.encryptedResponse) {
      let decryptedResponse = await this.decrypt(apiResponse.encryptedResponse, (apiRoute === 'RegisterMachine') ? true : false)
      if (apiRoute.includes('IssueTicket')) {

        this.valuesToPrint.firstValue = decryptedResponse
        this.valuesToPrint.secondValue = params.body
        this.valuesToPrint.thirdValue = paramsBeforeEncryption

      }
      ////console.log(decryptedResponse)
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
        return { status: false, message: `No internet connection and no cached data available.  ${apiRoute}` };
      }
    }
  }

  async getMachinePermission(permissionName: any, gameId: any = null, filterProperty = 'BitValue') {
    let userData = await this.getUserData()
    // //console.log(
    //   userData.UserSettings.map((usrSet: any) => {
    //     return { Name: usrSet.Name, SettingId: usrSet.SettingId, GameId: usrSet.GameId, ...usrSet }
    //   })
    // )

    const setting = userData.UserSettings.find(
      (setting: any) => (setting.Name == permissionName) && (setting.GameId == gameId)
    );

    const hasPermission = setting ? setting[filterProperty] : undefined;
    return hasPermission;
  }

  async registerMachine(params: any) {
    let machineData = await this.getMachineData();
    if (machineData) {
      machineData.Games = machineData.Games.map((gameItem: any) => ({
        ...gameItem,
        RouteName: gameItem.GameApi.split('/')[1]
      }));
      return machineData;
    }

    let apiResponse: any = await this.handleApiResponse('GameCooksAuth', 'RegisterMachine', 'POST', params)
    if (apiResponse.status == false) {
      this.setModalData(true, apiResponse.status, apiResponse.message)
      return
    }
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
    ////console.log(this.router.url)
    return route
  }

  async getGameId(gameIdOnly = true) {
    let machineData: any = await this.getMachineData()
    //console.log(machineData)
    let game = machineData.Games?.find((gameItem: any) => gameItem.RouteName === this.getGameRoute())
    //console.log(game)
    return (gameIdOnly) ? game.GameId : game
  }

  async loginMachine(loginParams: any) {
    let userData: any = await this.getUserData()
    if (userData && userData.UserName == loginParams.UserName && userData.UserPassword == loginParams.Password) {
      return {
        status: true,
        message: 'Login successful'
      }
    }
    
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
    let canUseOffline = await this.getMachinePermission('AllowOfflinePMU')
    let gameId = await this.getGameId()
    let params: any = {
      GameId: gameId,
      GameConfiguration: [],
      UserOnlineStatus: true
    }

    let gameEventsResponse = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/${canUseOffline ? 'GetOfflineEventConfiguration' : 'GetEventConfiguration'}`, 'POST', params)
    this.gameEventsList = gameEventsResponse.GameConfiguration
    if (this.isOnline) {
      this.updateMachineTicketId(gameId, gameEventsResponse.GameConfiguration.MachineTicketId);
    }
    this.getGameSettings(gameEventsResponse.GameConfiguration.PmuGameSettings)
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
    //const printerErrorPromise = this.bridge.waitForPrinterError();
    // const printerError = await this.bridge.waitForPrinterError();
    // console.log(printerError)
    let isPrintedFlag = 1;
    // if (printerError) {
    //   isPrintedFlag = 0; // failed printing
    // }
    let fullTicketId: any = ''

    //console.log('continuing issue ticket')
    let userData = await this.getUserData()
    let machineData = await this.getMachineData();
    let gameId = await this.getGameId()

    let date = new Date()

    let ticketRequestId = machineData.MachineId.toString() + machineData.MachineId.toString() + userData.PersonId.toString() + this.gnrcSrv.getFormattedToday() + gameId
    ticketRequestId = ("00000000000000000000000000000000000" + ticketRequestId).substring(ticketRequestId.length);

    let ticketBody = {
      GameId: await this.getGameId(),
      FullTicketId: fullTicketId,
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
      IsPrinted: isPrintedFlag,
      Printed: isPrintedFlag
    }
    console.log(ticketBody)
    let params = {
      GameId: await this.getGameId(),
      Ticket: ticketBody,
      TicketRequestId: ticketRequestId,
      LoyalityReferenceId: 0,
    }

    if (!this.isOnline) {
      const canPrint = await this.checksBeforePrinting(ticketObject);

      if (!canPrint) {
        return; // Stop execution
      }
      fullTicketId = await this.generateFullTicketId()
      params.Ticket.FullTicketId = fullTicketId
      let issueTicketReponse = await this.issueTicketData(ticketBody)
      const apiResponse = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/IssueTicket`, 'POST', params)
      this.bridge.sendPrintMessage('normalText', issueTicketReponse, 'IssueTicket', fullTicketId);
      let printResponse = {
        success: true
      }
      return printResponse
    }


    try {
      const apiResponse = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/IssueTicket`, 'POST', params)
      //console.log(apiResponse)
      if (apiResponse.DataToPrint) {
        this.bridge.sendPrintMessage('normalText', apiResponse.DataToPrint, apiResponse.Sender, apiResponse.FullTicketId);
        return apiResponse
      }
      else if (apiResponse.status == false) {
        this.setModalData(true, false, apiResponse.message)
        return apiResponse
      }
      //////console.log(apiResponse)
    } catch (error) {
      //////console.log(error)
    }
  }


  async validateTicket(fullTicketId: any) {

    let params: any = {
      FullTicketId: fullTicketId,
    }

    let validateTicketResponse = await this.handleApiResponse(`CommonAPI`, `CommonAPI/ValidateTicket`, 'POST', params)
    ////console.log(validateTicketResponse)

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
    ////console.log(cancelTicketResponse)
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
    //console.log(apiResponse)
    if (apiResponse.status == false) {
      this.setModalData(true, apiResponse.status, apiResponse.message)
    }
    return apiResponse.data
  }

  async getOutcomesListByMatchId(apiParams: any) {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetOutcomesListByMatchId`, 'POST', apiParams)
    //console.log(apiResponse)
    return apiResponse.data
  }

  async getOutcomesListByMatchCode(apiParams: any) {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetOutcomesListByEventCode`, 'POST', apiParams)
    if (apiResponse.status == false) {
      this.setModalData(true, apiResponse.status, apiResponse.message)
    }
    else if (apiResponse.data.length == 0) {
      let message = ''
      this.translate.get('machine.errorMessages.noOutcomesAvailable').subscribe((msg: string) => {
        message = msg
      });
      this.setModalData(true, false, message)
    }
    else {
      return apiResponse.data
    }

  }

  async getBonusRules() {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetBonusRules`, 'POST', {})
    ////console.log(apiResponse)
    return apiResponse
  }

  async getTicketByCode(apiParams: any) {
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetTicketByCode`, 'POST', apiParams)
    if (apiResponse.status == false) {
      this.setModalData(true, false, apiResponse.message)
      return null
    }
    ////console.log(apiResponse)
    return apiResponse
  }

  async getSbFixedConfig() {
    let params = {
      FixedConfigurationId: '1'
    }
    let apiResponse = await this.handleApiResponse('AfrijeuxSportsBetting', `AfrijeuxSportsBetting/GetFixedConfiguration`, 'POST', params)
    return apiResponse
  }

  async issueSBTicket(ticketObject: any) {
    let userData = await this.getUserData()
    let machineData = await this.getMachineData();
    let gameId = await this.getGameId()

    ticketObject.GameId = gameId
    ticketObject.MachineDateIssued = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS')
    //console.log(ticketObject)

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


  /************Offline Methods Start************/
  async getDeviceInfos() {
    const info = await this.bridge.getDeviceInfo();
    let printError = !info.hasSim || info.airplaneMode
    return printError
  }

  async checkCloseSales(fullTicketObject: any) {
    let printError = false
    const now = new Date();

    fullTicketObject.forEach((element: any) => {
      if (!printError) {
        printError = (new Date(element.closeSales) < now);
      }
    });

    return printError
  }

  async checkMaxSales(ticketPrice: any) {
    let gameId = await this.getGameId()
    let todaysSales = await this.bridge.getTodayPrintedSum(gameId)
    let maxSales = await this.getMachinePermission('SalesMaximum', gameId, 'RealValue')
    let maxSalesError = (todaysSales + ticketPrice) > maxSales
    return maxSalesError
  }

  async checkMaxStake(ticketPrice: any) {
    let gameId = await this.getGameId()
    let maxStake = await this.getMachinePermission('MaxStakeLimit', gameId, 'RealValue')
    let maxStakeError = ticketPrice > maxStake
    //console.log(maxStake)
    return maxStakeError
  }

  async checksBeforePrinting(fullTicketObject: any) {
    let canPrint = false
    let permissionError = !await this.getMachinePermission('AllowOfflinePMU')
    let simAirplaneError = await this.getDeviceInfos()
    let dateError = await this.checkCloseSales(fullTicketObject)
    let maxSalesError = await this.checkMaxSales(fullTicketObject.TicketPrice)
    let maxStakeError = await this.checkMaxStake(fullTicketObject.TicketPrice)

    //console.log(`Offline PMU Permission Error : ${permissionError}`)
    //console.log(`Device Info Error:  ${simAirplaneError}`)
    //console.log(`Date Error:  ${dateError}`)
    //console.log(`Max Sales Error:  ${maxSalesError}`)
    //console.log(`Max Stake Error:  ${maxStakeError}`)

    let onlinePrintError = dateError || maxSalesError || maxStakeError
    let offlinePrintError = permissionError || dateError || maxSalesError || maxStakeError

    if (!navigator.onLine && offlinePrintError) {
      this.setModalData(true, false, 'Printing Error')
      return
    }

    canPrint = true
    return canPrint
  }

  async generateFullTicketId() {
    debugger
    let machineData = await this.getMachineData();
    let gameId = await this.getGameId()
    let fullTicketId = '0';

    // Get current date details
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    const formattedYear = now.getFullYear().toString().slice(-2); // "yy"

    // Random 4-digit security key
    const randomInt = Math.floor(Math.random() * 9999) + 1;

    // ✅ Simulated global settings (replace with real storage)
    const globalSettings = await this.getMachineTicketId(gameId);
    console.log('blobal settings value' + globalSettings)
    let machineTicketId = globalSettings ?? 1;

    if (machineTicketId === 9999) {
      machineTicketId = 1;
    } else {
      machineTicketId++;
    }

    // Retrieve operation & machine IDs (replace with your real data source)
    const operationId = machineData.OperationId; // e.g., from session/user data
    const machineId = machineData.MachineId; // e.g., from local storage / config

    // Construct full ticket ID (matches Java formatting exactly)
    const fullTicketIdBuilder =
      this.pad(gameId, 3) +
      this.pad(operationId, 3) +
      this.pad(machineId, 4) +
      this.pad(dayOfYear, 3) +
      this.pad(Number(formattedYear), 2) +
      '1' +
      this.pad(machineTicketId, 4) +
      this.pad(randomInt, 4);

    fullTicketId = fullTicketIdBuilder;
    console.log(machineTicketId)

    // Save new machine ticket ID
    this.updateMachineTicketId(gameId, machineTicketId);
    //console.log(fullTicketId)
    return fullTicketId;
  }

  // Helper to pad with leading zeros
  private pad(num: number, size: number): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  private async getMachineTicketId(gameId: number): Promise<number | null> {
    const machineTicketData = await this.cacheSrv.getFromFlutterOfflineCache('machine_ticket_data');

    if (!machineTicketData || !machineTicketData.MachineTicketIds) return null;

    const val = machineTicketData.MachineTicketIds[gameId];
    return val ? parseInt(val, 10) : null;
  }

  private async updateMachineTicketId(gameId: number, value: number): Promise<void> {
    let machineTicketData = await this.cacheSrv.getFromFlutterOfflineCache('machine_ticket_data');
    console.log('fetched machine data')
    console.log(machineTicketData)
    // Initialize if not existing
    if (!machineTicketData) {
      machineTicketData = { MachineTicketIds: {} };
    } else if (!machineTicketData.MachineTicketIds) {
      machineTicketData.MachineTicketIds = {};
    }

    machineTicketData.MachineTicketIds[gameId] = value;
    console.log('updating machine data')
    console.log(machineTicketData)
    // Save updated data back to its own cache key
    this.cacheSrv.saveToFlutterOfflineCache('machine_ticket_data', machineTicketData);

    // Optionally mirror in local storage (if needed for UI or quick access)
    this.localStorageSrv.setItem('machine_ticket_data', machineTicketData, true);
  }

  async getStringSettingValue(settingName: any, gameId = null, filterProperty = 'TextValue') {
    let gameSettings = await this.cacheSrv.getFromFlutterOfflineCache('game_settings');
    //console.log(gameSettings)
    const setting = gameSettings.find(
      (setting: any) => (setting.Name == settingName) && (setting.GameId == gameId)
    );
    const stringValue = setting ? setting[filterProperty] : undefined;
    return stringValue;
  }

  async getGameSettings(SettingVersion: any) {
    let gameId = await this.getGameId()
    let params: any = {
      GameId: gameId,
      SettingVersion: SettingVersion
    }
    let apiResponse: any = await this.handleApiResponse(this.getGameRoute(), `${this.getGameRoute()}/GetSettings`, 'POST', params)
    this.cacheSrv.saveToFlutterOfflineCache('game_settings', apiResponse.data);
    this.localStorageSrv.setItem('game_settings', apiResponse.data, true);
    //console.log(apiResponse.data)
  }

  public async issueTicketData(ticket: any, isPromotion = false) {
    let game: any = await this.getGameId(false)
    let userData = await this.getUserData()
    let machineData: any = await this.getMachineData()
    const formatTime = new Intl.DateTimeFormat('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const newLine = '\n';
    const dataToPrint: string[] = [];

    const separator = await this.getStringSettingValue('PrintTicketSeparator', null);
    let header = await this.getStringSettingValue('PrintTicketHeader', null);
    let footer = await this.getStringSettingValue('PrintTicketFooter', null);
    const onTicketMessage = await this.getStringSettingValue('OnTicketMessage', game.GameId);
    const ticketDaysToExpire = await this.getStringSettingValue('TicketDaysToExpier', null, 'IntValue');


    header = header
      .replace('[GameName]', game.Name)
      .replace('[Separator]', separator)
      .replace(/\[\\n\]/g, newLine);

    dataToPrint.push(header);
    dataToPrint.push('#indicator#');
    //console.log(dataToPrint)

    let body = '';
    //console.log(ticket)
    //console.log(this.gameEventsList)
    for (const pick of ticket.GamePick) {
      for (const pickDetails of pick.PickDetails) {
        let bodyTemplate = await this.getStringSettingValue('PrintTicketBody', null);

        const config = this.gameEventsList.EventConfiguration.find((eventItem: any) => eventItem.GameEventId == pick.GameEventId);
        //console.log(config)
        const countNonPartant = config.NonPartant.split(',').length - 1;
        const gameEventIdIndex = config.EventNumber;

        bodyTemplate = bodyTemplate
          .replace('[EventId]', `${config.ReunionCode} ${config.GameEventId}`)
          .replace('[EventName]', `${config.EventName}`)
          .replace('[NumberofHorses]', (config.HorseNumber - countNonPartant).toString())
          .replace('[EventDate]', config.EventDate)
          .replace('[Separator]', separator)
          .replace(/\[\\n\]/g, newLine);




        // 🐴 Handle horses
        const baseHorses = pickDetails.BaseHorses.split(',').filter((h: any) => h !== '0' && h !== '00');
        const associatedHorses = pickDetails.AssociatedHorses.split(',');


        let stringPicks = '';
        const champString = `${pickDetails.BetType}${baseHorses.length > 0 ? '/Champ' : ''}${pick.TicketTypeId > 1 ? '/' + pickDetails.FormuleType : ''}`;
        stringPicks += champString;

        if (pick.Multiplier < 1) {
          stringPicks += `, Flexi ${(pick.Multiplier * 100)}%`;
        }

        stringPicks += newLine;

        const horseIds = associatedHorses.map((h: string) => (parseInt(h.trim(), 10) + gameEventIdIndex * 100).toString());

        if (baseHorses.length > 0) {
          stringPicks += `CH.BASE: ${pickDetails.BaseHorses.replace('00', 'XX')}${newLine}`;
          stringPicks += `CH.ASS: ${pickDetails.AssociatedHorses}${newLine}`;
        } else {
          stringPicks += `CH.JOUÉ: ${pickDetails.AssociatedHorses}${newLine}`;
        }

        stringPicks += `Totale: ${pick.Stake}${newLine}`

        let numberOfCombinations = pick.NumberOfCombinations;



        if (pick.Multiplier > 1) {
          stringPicks += `Multiplier: ${pick.Multiplier}${newLine}`;
        }

        //stringPicks += `Total: ${pick.stake.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${this.localLogin.getCurrency()}`;
        stringPicks += newLine + separator + newLine + newLine;
        bodyTemplate += `${newLine}${newLine}${stringPicks}`;
        body += bodyTemplate;
        //console.log(bodyTemplate)
      }
    }

    let ticketExpiry = new Date(
      new Date(ticket.MachineDateIssued).setDate(
        new Date(ticket.MachineDateIssued).getDate() + ticketDaysToExpire
      )
    )

    // 🧾 Footer replacement
    footer = footer
      .replace('[TotalStake]', ticket.Stake.toLocaleString('en-US'))
      .replace('[Currency]', userData.Currency)
      .replace('[DateIssued]', formatTime.format(new Date(ticket.MachineDateIssued)))
      .replace('[AgentName]', userData.PersonName)
      .replace('[MachineCode]', machineData.MachineCode)
      .replace('[ExpierdDate]', formatTime.format(ticketExpiry))
      .replace('[TicketCode]', '---')
      .replace('[Separator]', separator)
      .replace('[Message]', onTicketMessage)
      .replace(/\[\\n\]/g, newLine);

    if (ticket.referenceId) {
      footer += `Reference ID: ${ticket.ReferenceId}`;
    }

    body += footer;
    dataToPrint.push(body);
    //console.log(dataToPrint)
    return dataToPrint;
  }

  encryptToBase64(data: any, key: string): string {
    const xxtea = require('xxtea-node');
    const json = JSON.stringify(data);
    const encrypted = xxtea.encrypt(xxtea.toBytes(json), xxtea.toBytes(key));

    if (!encrypted) return ''; // safeguard if encryption fails

    const uint8Array = new Uint8Array(encrypted);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  async syncOfflineTickets(tickets: any) {
    let machineData = await this.getMachineData();
    let encryptedTickets: any = '';
    console.log(tickets)
    tickets.forEach((ticketItem: any) => {
      ticketItem.EncryptedDTO = ticketItem.IssueTicketRequestObject;
      ticketItem.Printed = ticketItem.IsPrinted;
      ticketItem.FullTicketId = ticketItem.FullTicketId;
      ticketItem.isCancelLatest = ticketItem.isCancelLatest;
      ticketItem = this.encryptToBase64(ticketItem, this.encryptionKey);
      const fileRequest = {
        EncryptedRequestDTO: ticketItem,
        requestdate: this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS'),
        iscancel: false
      };
      //console.log('file request here ')
      //console.log(fileRequest)
      const finalBase64 = this.encryptToBase64(fileRequest, this.encryptionKey);
      if (encryptedTickets.length > 0) {
        encryptedTickets += ";";
      }
      encryptedTickets += finalBase64;

    });

    let params = {
      OperationId: machineData.OperationId,
      TicketSourceId: 1,
      Tickets: encryptedTickets
    }

    let apiResponse = await this.handleApiResponse('PMUHybrid', 'PMUHybrid/ProcessTickets', 'POST', params)
    await this.updateTicketsInDb(apiResponse.data)
    this.setModalData(true, true, 'All Tickets are  synced.');
    console.log(apiResponse)
  }

  async updateTicketsInDb(tickets: any[]): Promise<void> {
    if (!tickets?.length) return;

    if (!(window as any).OfflineCache?.postMessage) {
      console.warn("⚠️ OfflineCache not available");
      return;
    }

    console.log("📤 Sending update_ticket messages for", tickets.length, "tickets...");

    return new Promise<void>((resolve) => {
      const totalTickets = tickets.length;
      let updatedCount = 0;

      const subscription = this.bridge.ticketUpdated$
        .pipe(filter(update => !!update?.FullTicketId))
        .subscribe((update: any) => {
          updatedCount++;
          console.log(`✅ Ticket updated: ${update.FullTicketId} (${updatedCount}/${totalTickets})`);

          if (updatedCount >= totalTickets) {
            console.log("🎉 All tickets updated successfully!");
            subscription.unsubscribe();
            resolve();
          }
        });

      tickets.forEach(ticket => {
        const message = JSON.stringify({
          action: 'update_ticket',
          data: { FullTicketId: ticket.FullTicketId }
        });
        (window as any).OfflineCache.postMessage(message);
        console.log("📨 Sent update_ticket:", message);
      });
    });
  }






  /************Offline Methods End************/

}
