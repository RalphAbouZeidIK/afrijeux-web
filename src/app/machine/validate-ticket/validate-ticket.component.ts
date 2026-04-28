import { Component } from '@angular/core';
import { CacheService } from 'src/app/services/cache.service';
import { GenericService } from 'src/app/services/generic.service';
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

  showForm = false

  formTitle = ''

  showError = false

  formDescription = ''

  showWinningDetails = false

  constructor(
    private machineSrv: MachineService,
    private nativeBridge: NativeBridgeService,
    private cacheService: CacheService,
    private gnrcSrv: GenericService
  ) {
    this.nativeBridge.scanResult$.subscribe(result => {
      if (result != 'Scan canceled or failed') {
        this.fullTicketId = result;
        this.validateTicket()
      }
      else {
        this.gnrcSrv.setModalData(true, false, `Scan canceled or failed`)
        this.showForm = true
      }

    });
  }

  async ngOnInit() {
    this.scanCode()
    this.fullTicketId = ''
    this.canPayTicket = await this.machineSrv.getMachinePermission('TerminalCanPayTicket');


  }

  async getLatestTicket() {
    let gameId = this.fullTicketId?.substring(0, 3);
    //console.log(gameId)
    const tickets = await this.cacheService.getTicketsFromFlutter({ GameId: gameId, latestOnly: true });
    //console.log("🎟️ Tickets from cache:", tickets);

    if (tickets.length > 0) {
      // ✅ Ready to use immediately
      //console.log(tickets)
      if (tickets[0].FullTicketId != this.fullTicketId) {
        this.canFlagToCancel = false
      }
    } else {
      console.warn("⚠️ No tickets found");
    }
  }



  scanCode(): void {
    this.nativeBridge.requestScan();
  }

  async validateTicket() {
    this.showError = false
    this.showWinningDetails = false
    this.formTitle = ''
    this.formDescription = ''
    this.gnrcSrv.toggleLoader(true);

    let validateTicketReponse = await this.machineSrv.validateTicket(this.fullTicketId)
    console.log(validateTicketReponse)

    this.isPaying = true
    this.showForm = true
    if (validateTicketReponse.status == true) {

      if (validateTicketReponse.IsWinning == 0) {
        this.formTitle = this.machineSrv.extractMessage(validateTicketReponse.message)
        this.formDescription = `This ticket has not been validated yet.`
        this.showError = true
        return
      }
      else {
        this.showWinningDetails = true
        this.getCancelPermission()
        this.payTicketResponse = validateTicketReponse
        //console.log(this.payTicketResponse)
        if (validateTicketReponse.dataToPrint.trim() == '') {
          this.showCancelPage = true
        }

      }

    }

    if (validateTicketReponse.status == false) {
      this.showError = true
      let code = this.machineSrv.extractCode(validateTicketReponse.message)
      
      if (code == 'MX0000026') {
        this.formDescription = `This is not a winning ticket.`
      }
      if (code == 'MX0000024') {
        this.formDescription = `This ticket has already been paid.`
      }
      this.formTitle = this.machineSrv.extractMessage(validateTicketReponse.message)

      this.showError = true
    }

    this.gnrcSrv.toggleLoader(false)
    //console.log(validateTicketReponse)
  }

  async payTicket() {
    let payTicketReponse = await this.machineSrv.payTicket(this.fullTicketId)
    console.log(payTicketReponse)
    if (payTicketReponse.DataToPrint) {
      this.fullTicketId = ''
      this.isPaying = false
    }
    //console.log(payTicketReponse)
  }

  async getCancelPermission() {
    let gameId = this.fullTicketId?.substring(0, 3);
    //this.canCancelTicket = await this.machineSrv.getMachinePermission('TerminalCanCancel', Number(gameId))
    this.canFlagToCancel = await this.machineSrv.getMachinePermission('TerminalCanFlagToCancel', Number(gameId))
    this.getLatestTicket()

  }

  async cancelTicket() {
    let params = {
      fullTicketId: this.fullTicketId,
      IsLatest: true
    }
    let cancelTicketResponse = await this.machineSrv.cancelTicket(params)
    if (cancelTicketResponse) {
      this.isPaying = false
      this.fullTicketId = ''
    }
  }

  getFormattedDataToPrint(): string {
    if (!this.payTicketResponse?.dataToPrint) return '';
    // Convert escaped newlines (\n) to actual newlines for proper display
    return this.payTicketResponse.dataToPrint.replace(/\\n/g, '\n');
  }

}
