import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  constructor(private apiSrv: ApiService) { }

  async registerMachine(machineId: any, versionCode: any) {
    const params = {
      "Machine": machineId,
      "VersionCode": versionCode,
      "TimeStamp": new Date().toISOString()
    }
    console.log(params)
    const apiResponse = await this.apiSrv.makeApi('GameCooksAuth', 'RegisterMachine', 'POST', params, false)
    console.log(apiResponse)
  }
}
