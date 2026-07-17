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

  // Blocks the screen while a scheduled report is being generated/printed, so nobody
  // can interact with the machine mid-print (esp. relevant when catching up on
  // several missed days' reports in a row).
  isPrintingScheduledReport = false;

  // Time of day (24h) the machine report should be auto-printed, unattended.
  private readonly scheduledReportPrintTime = { hour: 0, minute: 0 }
  private readonly lastAutoPrintDateStorageKey = 'lastMachineReportAutoPrintDate'
  private readonly lastAutoPrintTimestampStorageKey = 'lastMachineReportAutoPrintTimestamp'
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
    this.scheduledReportCheckInterval = setInterval(() => this.checkScheduledReportPrint(), 30000);
    // The interval above can be suspended for as long as the screen stays locked, so also
    // check right away whenever the WebView becomes visible again (i.e. right after unlock).
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngOnDestroy(): void {
    if (this.scheduledReportCheckInterval) {
      clearInterval(this.scheduledReportCheckInterval);
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.checkScheduledReportPrint();
    }
  }

  private async checkScheduledReportPrint() {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    const scheduledTimeToday = new Date(now);
    scheduledTimeToday.setHours(this.scheduledReportPrintTime.hour, this.scheduledReportPrintTime.minute, 0, 0);

    // "Has the scheduled time already passed today" rather than an exact-minute match:
    // while the Android screen is locked, the WebView's JS timers get suspended/throttled,
    // so an exact-minute check can be skipped entirely and never fire again that day. This
    // way, whenever the interval next gets to run (e.g. right after the device is unlocked),
    // it still catches up and prints.
    if (
      now < scheduledTimeToday ||
      localStorage.getItem(this.lastAutoPrintDateStorageKey) === todayKey
    ) {
      return;
    }

    const canPrintReport = await this.machineSrv.getMachinePermission('TerminalCanPrintReport', null);
    if (!canPrintReport) {
      return;
    }

    // One report PER missed scheduled day, not a single report spanning the whole gap:
    // e.g. if 2 days were missed (machine locked through their scheduled time), this
    // prints 2 separate reports, each covering just its own day.
    let windowStart = localStorage.getItem(this.lastAutoPrintTimestampStorageKey) != null
      ? new Date(localStorage.getItem(this.lastAutoPrintTimestampStorageKey)!)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const nextScheduledInstant = new Date(windowStart);
    nextScheduledInstant.setHours(this.scheduledReportPrintTime.hour, this.scheduledReportPrintTime.minute, 0, 0);
    if (nextScheduledInstant <= windowStart) {
      nextScheduledInstant.setDate(nextScheduledInstant.getDate() + 1);
    }

    const missedScheduledInstants: Date[] = [];
    for (const cursor = nextScheduledInstant; cursor <= now; cursor.setDate(cursor.getDate() + 1)) {
      missedScheduledInstants.push(new Date(cursor));
    }

    this.isPrintingScheduledReport = true;
    try {
      for (const scheduledInstant of missedScheduledInstants) {
        const reportParams = {
          Date: this.datepipe.transform(windowStart, 'yyyy-MM-ddTHH:mm:ss.SSS'),
          FromDate: this.datepipe.transform(windowStart, 'yyyy-MM-ddTHH:mm:ss.SSS'),
          ToDate: this.datepipe.transform(scheduledInstant, 'yyyy-MM-ddTHH:mm:ss.SSS'),
          GameId: null,
          GameEventId: null,
          EventCode: null,
          apiRoute: null
        };

        await this.machineSrv.getReports(reportParams, true, false);

        windowStart = scheduledInstant;
        localStorage.setItem(this.lastAutoPrintTimestampStorageKey, windowStart.toISOString());
      }

      localStorage.setItem(this.lastAutoPrintDateStorageKey, todayKey);
    } finally {
      this.isPrintingScheduledReport = false;
    }
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



  // onPrint() {
  //   this.bridge.print();
  // }
}
