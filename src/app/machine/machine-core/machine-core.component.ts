import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';
import { PopupComponent } from 'src/app/shared/popup/popup.component';

@Component({
  selector: 'app-machine-core',
  templateUrl: './machine-core.component.html',
  styleUrl: './machine-core.component.scss',
  standalone: false
})
export class MachineCoreComponent implements OnInit, OnDestroy {
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

  // Time of day (24h) the machine report should be auto-printed, unattended.
  private readonly scheduledReportPrintTime = { hour: 22, minute: 30 }
  private readonly lastAutoPrintDateStorageKey = 'lastMachineReportAutoPrintDate'
  private scheduledReportCheckInterval: any

  constructor(
    private bridge: NativeBridgeService,
    private machineSrv: MachineService,
    private datepipe: DatePipe
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
    //this.checkForApkUpdate()
    this.scheduledReportCheckInterval = setInterval(() => this.checkScheduledReportPrint(), 30000);
  }

  ngOnDestroy(): void {
    if (this.scheduledReportCheckInterval) {
      clearInterval(this.scheduledReportCheckInterval);
    }
  }

  private async checkScheduledReportPrint() {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    if (
      now.getHours() !== this.scheduledReportPrintTime.hour ||
      now.getMinutes() !== this.scheduledReportPrintTime.minute ||
      localStorage.getItem(this.lastAutoPrintDateStorageKey) === todayKey
    ) {
      return;
    }

    localStorage.setItem(this.lastAutoPrintDateStorageKey, todayKey);

    const canPrintReport = await this.machineSrv.getMachinePermission('TerminalCanPrintReport', null);
    if (!canPrintReport) {
      return;
    }

    const fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - 1);

    const reportParams = {
      Date: this.datepipe.transform(fromDate, 'yyyy-MM-ddTHH:mm:ss.SSS'),
      FromDate: this.datepipe.transform(fromDate, 'yyyy-MM-ddTHH:mm:ss.SSS'),
      ToDate: this.datepipe.transform(now, 'yyyy-MM-ddTHH:mm:ss.SSS'),
      GameId: null,
      GameEventId: null,
      EventCode: null,
      apiRoute: null
    };

    await this.machineSrv.getReports(reportParams, true, false);
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
