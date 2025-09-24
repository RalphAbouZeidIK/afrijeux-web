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


  showPopup() {
    this.machineSrv.setModalData(true, false, this.description)
    // setTimeout(() => {
    //   this.machineSrv.setModalData(false, false, 'ErrorSuccessMessages.Unothorized')
    // }, 5000);
  }

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

    this.bridge.scanResult$.subscribe(result => {
      this.scannedResult = result;
      if (result) {
        alert(`Scanned result: ${result}`);
      }
    });

    const apiResponse = await this.machineSrv.registerMachine();
    console.log(apiResponse)
    if (apiResponse.CommunicationKey) {
      this.isAppRegistered = true
    }
    else {
      this.title = 'Error'
      this.description = 'Machine not registered. Please contact the administrator.'
      this.showPopup()
      this.isAppRegistered = false
    }

  }


  onScan() {
    this.bridge.requestScan();
  }

  onPrint() {
    this.bridge.print();
  }
}
