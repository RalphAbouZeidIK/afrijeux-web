import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-admin-deposit',
  standalone: false,
  templateUrl: './admin-deposit.component.html',
  styleUrl: './admin-deposit.component.scss'
})
export class AdminDepositComponent {

  isIssuing = false;


  depositForm = new FormGroup({
    Stake: new FormControl(null, [Validators.required]),
    Username: new FormControl('', [Validators.required])
  });

  constructor(private machineSrv: MachineService) { }

  async issueTicket() {
    if (this.isIssuing) return; // 🚫 prevent multiple clicks

    this.isIssuing = true;

    try {
      let listOfBets: any = [];
      listOfBets.Stake = this.depositForm.value.Stake;
      listOfBets.TicketPrice = this.depositForm.value.Stake;
      listOfBets.User = this.depositForm.value.Username;
      let customRoute = {
        subRoute:'Master',
        apiRoute:'Tickets/IssueTicket'
      }
      let apiResponse = await this.machineSrv.issueTicket(listOfBets,false,customRoute);
      //console.log('issue ticket', apiResponse);
    } catch (err) {
      console.error(err);
    } finally {
      this.isIssuing = false; // ✅ unlock after response
    }
  }
}
