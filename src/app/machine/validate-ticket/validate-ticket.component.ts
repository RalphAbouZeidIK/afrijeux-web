import { Component } from '@angular/core';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';

@Component({
  selector: 'app-validate-ticket',
  templateUrl: './validate-ticket.component.html',
  styleUrl: './validate-ticket.component.scss',
  standalone: false
})
export class ValidateTicketComponent {

  fullTicketId: any = '';

  constructor(
    private machineSrv: MachineService,
    private nativeBridge: NativeBridgeService
  ) {
    this.nativeBridge.scanResult$.subscribe(result => {
      this.fullTicketId = result;
    });
  }


  scanCode(): void {
    this.nativeBridge.requestScan();
  }

  async validateTicket() {
    let validateTicketReponse = await this.machineSrv.validateTicket(this.fullTicketId)
    console.log(validateTicketReponse)
  }

}
