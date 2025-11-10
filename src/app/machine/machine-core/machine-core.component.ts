import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';
import { PopupComponent } from 'src/app/shared/popup/popup.component';

@Component({
  selector: 'app-machine-core',
  templateUrl: './machine-core.component.html',
  styleUrl: './machine-core.component.scss',
  standalone: false
})
export class MachineCoreComponent implements OnInit {
  @ViewChild('popup') popup!: PopupComponent;
  @ViewChild('popupTemplate') popupTemplate!: TemplateRef<any>;  // 👈 FIX
  openModal = false;

  title = 'Default Title';
  description = 'Default Description';
  scanned = '';
  scannedResult: any = '';
  isAppRegistered = false

  constructor(
    private bridge: NativeBridgeService,
    private machineSrv: MachineService
  ) { }
  
  closePopup() {
    this.popup.close();
  }

  ngOnInit(): void {
    this.getMachineData();
  }

  async getMachineData() {
    this.bridge.scanResult$.subscribe((result) => {
      if (result) {
        this.scanned = result;
      }
    });

    let params = {
      Machine: await this.bridge.getSerial(),
      VersionCode: '1.0.0'
    }

    const apiResponse = await this.machineSrv.registerMachine(params);

    ////console.log(apiResponse)
    if (apiResponse?.CommunicationKey) {
      this.isAppRegistered = true
    }

    const ip = await this.bridge.getDeviceIpFromFlutter();
    this.machineSrv.setDeviceIp(ip);
    console.log("Device IP:", ip);


  }


  onScan() {
    this.bridge.requestScan();
  }

  // onPrint() {
  //   this.bridge.print();
  // }
}
