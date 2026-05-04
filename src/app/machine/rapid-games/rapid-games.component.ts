import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-rapid-games',
  standalone: false,
  templateUrl: './rapid-games.component.html',
  styleUrl: './rapid-games.component.scss'
})
export class RapidGamesComponent {

  isKeno = window.location.href.includes('AfrijeuxKeno')

  isRapid = window.location.href.includes('AfrijeuxRapid')

  constructor(
    private machineSrv: MachineService,
    private router: Router
  ) { }


  onBackClick() {
    this.router.navigate(['/Machine/Games'])
  }

  async issueTicket() {
    let listOfBets: any = []
    listOfBets.TicketPrice = 100
    let apiResponse = await this.machineSrv.issueTicket(listOfBets)
    console.log('issue ticket', apiResponse)
  }
}
