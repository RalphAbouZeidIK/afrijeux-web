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

  showAdminPopup = false;

  showAdminPage = false;

  showAdminPageFlag = false

  constructor(
    private bridge: NativeBridgeService,
    private machineSrv: MachineService
  ) {
    this.machineSrv.getAdminPopupStatus().subscribe(status => {
      this.showAdminPopup = status.showPopup;
      this.showAdminPageFlag = status.showAdminPage;
    });

    this.machineSrv.getAdminLoginStatus().subscribe(status => {
      this.showAdminPage = status.showAdminPage;
      this.showAdminPopup = false

    })
  }

  closePopup() {
    this.popup.close();
  }

  ngOnInit(): void {
    this.getMachineData();
    this.checkForApkUpdate()
  }

  async getMachineData() {
    // this.bridge.scanResult$.subscribe((result) => {
    //   if (result) {
    //     this.scanned = result;
    //   }
    // });

    let params = {
      //CHANGE HERE TO GET OLD MACHINE CODE
      Machine: await this.bridge.getSerial(),
      //Machine: 'B42M001K02400073',
      VersionCode: '1.0.0'
    }

    //console.log("Params:", params)
    const apiResponse = await this.machineSrv.registerMachine(params);
    console.log("API Response:", apiResponse);
    //console.log(apiResponse)
    if (apiResponse?.CommunicationKey) {
      this.isAppRegistered = true
      //this.checkForUpdates();
    }

    const ip = await this.bridge.getDeviceIpFromFlutter();
    this.machineSrv.setDeviceIp(ip);
    //console.log("Device IP:", ip);


  }

  onScan() {
    this.bridge.requestScan();
  }


  async checkForApkUpdate() {
    const alreadyAvailable = (window as any).flutterBuildCode;
    if (alreadyAvailable !== undefined) {
      this.machineSrv.runUpdateCheck(alreadyAvailable);
    } else {
      window.addEventListener('flutterBuildCodeReady', (e: Event) => {
        this.machineSrv.runUpdateCheck((e as CustomEvent).detail as number);
      }, { once: true });
    }
  }

  // onPrint() {
  //   this.bridge.print();
  // }
}
