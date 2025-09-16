import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NativeBridgeService } from './native-bridge.service';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  machineId: any;
  machineData: any;
  constructor(private apiSrv: ApiService, private bridge: NativeBridgeService) { }

  async registerMachine() {
    this.machineId = await this.bridge.getSerial()
    const params = {
      "Machine": this.machineId,
      "VersionCode": '1.0.0',
      "TimeStamp": new Date().toISOString()
    }

    const apiResponse = await this.apiSrv.makeApi('GameCooksAuth', 'RegisterMachine', 'POST', params, false)
    this.machineData = apiResponse
    return apiResponse;
  }

  async loginMachine(loginParams: any) {

    const params = {
      "UserName": loginParams.UserName,
      "Password": loginParams.Password,
      "Ip": loginParams.Ip,
      "MachineId": this.machineId,
      "GameOperationId": this.machineData?.OperationId,
      "TimeStamp": new Date().toISOString()
    }
    console.log(params)
    
    const apiResponse = await this.apiSrv.makeApi('GameCooksAuth', 'LoginMachine', 'POST', params, false)
    return apiResponse;
  }

}
