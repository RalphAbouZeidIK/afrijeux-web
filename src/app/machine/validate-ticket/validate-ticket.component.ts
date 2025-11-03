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

  isPaying: boolean = false;

  payTicketResponse: any;

  canPayTicket: any = false

  //canCancelTicket: any = false

  canFlagToCancel: any = false

  showCancelPage: boolean = false

  constructor(
    private machineSrv: MachineService,
    private nativeBridge: NativeBridgeService
  ) {
    this.nativeBridge.scanResult$.subscribe(result => {
      this.fullTicketId = result;
    });
  }

  async ngOnInit() {
    this.fullTicketId = ''
    this.canPayTicket = await this.machineSrv.getMachinePermission('TerminalCanPayTicket');
  }


  scanCode(): void {
    this.nativeBridge.requestScan();
  }

  async validateTicket() {
    let validateTicketReponse = await this.machineSrv.validateTicket(this.fullTicketId)
    if (validateTicketReponse.status == true) {
      this.getCancelPermission()
      this.payTicketResponse = validateTicketReponse
      this.isPaying = true
      if (validateTicketReponse.dataToPrint.trim() == '') {
        this.showCancelPage = true
      }



    }

    ////console.log(validateTicketReponse)
  }

  async payTicket() {
    let payTicketReponse = await this.machineSrv.payTicket(this.fullTicketId)
    if (payTicketReponse.DataToPrint) {
      this.fullTicketId = ''
      this.isPaying = false
    }
    ////console.log(payTicketReponse)
  }

  async getCancelPermission() {
    let gameId = this.fullTicketId?.substring(0, 3);
    //this.canCancelTicket = await this.machineSrv.getMachinePermission('TerminalCanCancel', Number(gameId))
    this.canFlagToCancel = await this.machineSrv.getMachinePermission('TerminalCanFlagToCancel', Number(gameId))
  }

  async cancelTicket() {
    let params = {
      fullTicketId: this.fullTicketId,
      IsLatest: true
    }
    let cancelTicketResponse = await this.machineSrv.cancelTicket(params)
    if(cancelTicketResponse){
      this.isPaying = false
      this.fullTicketId = ''
    }
  }

}
