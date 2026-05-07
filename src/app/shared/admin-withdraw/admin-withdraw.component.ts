import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-admin-withdraw',
  standalone: false,
  templateUrl: './admin-withdraw.component.html',
  styleUrl: './admin-withdraw.component.scss'
})
export class AdminWithdrawComponent {

  isIssuing = false;


  withdrawForm = new FormGroup({
    Code: new FormControl(null, [Validators.required]),
    Username: new FormControl('', [Validators.required])
  });

  constructor(private machineSrv: MachineService) { }

  async issueTicket() {
    if (this.isIssuing) return; // 🚫 prevent multiple clicks

    this.isIssuing = true;

    try {
      let listOfBets: any = [];
      listOfBets.Code = this.withdrawForm.value.Code;
      listOfBets.User = this.withdrawForm.value.Username;
      let customRoute = {
        subRoute: 'Master',
        apiRoute: 'Tickets/WithdrawRequest'
      }
      let apiResponse = await this.machineSrv.issueTicket(listOfBets, false, customRoute);
      if (apiResponse.status === true) {
        let listOfBets: any = [];
        listOfBets.Code = apiResponse.TicketCode;
        listOfBets.UserId = apiResponse.UserId;
        let customRoute = {
          subRoute: 'Master',
          apiRoute: 'Tickets/PayTicket'
        }
        let issueTicketResponse = await this.machineSrv.issueTicket(listOfBets, false, customRoute);
      }
      console.log('issue ticket', apiResponse);
    } catch (err) {
      console.error(err);
    } finally {
      this.isIssuing = false; // ✅ unlock after response
    }
  }
}
