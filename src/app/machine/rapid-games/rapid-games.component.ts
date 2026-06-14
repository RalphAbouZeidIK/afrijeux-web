import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';

@Component({
  selector: 'app-rapid-games',
  standalone: false,
  templateUrl: './rapid-games.component.html',
  styleUrl: './rapid-games.component.scss'
})
export class RapidGamesComponent {

  isKeno = window.location.href.includes('WinBigKeno')

  isRapid = /WinBigRapid(Emojis|Football|Fruits|Luxury|Numbers|NumbersLite)?($|[^a-zA-Z])/.test(window.location.href)

  rapidGameType: 'Fruits' | 'Animals' | 'Football' | 'Luxury' | 'Emojis' | 'Numbers' | 'NumbersLite' =
    (/WinBigRapid(Emojis|Football|Fruits|Luxury|NumbersLite|Numbers)/.exec(window.location.href)?.[1] as any) ?? 'Animals';

  get gameTitle(): string {
    if (this.isKeno) return 'Keno Games';
    const titles: Partial<Record<typeof this.rapidGameType, string>> = {
      NumbersLite: 'Quick Match',
      Numbers: 'Mega Win',
    };
    return titles[this.rapidGameType] ?? `Rapid ${this.rapidGameType}`;
  }

  constructor(
    private machineSrv: MachineService,
    private router: Router,
    private bridge: NativeBridgeService,
    private gnrcSrv: GenericService
  ) {

    this.bridge.getPrintingStatus().subscribe((status) => {
      //console.log('Printing status updated:', status);
      setTimeout(() => {
        this.isIssuing = false;
      }, 200);
      if (!status) {
        this.gnrcSrv.setModalData(true, false, 'Failed to print ticket.');
      }
    })
  }


  onBackClick() {
    this.router.navigate(['/Machine/Games'], { queryParams: { normalGamesShown: false } });
  }

  isIssuing = false;

  async issueTicket() {
    if (this.isIssuing) return; // 🚫 prevent multiple clicks

    this.isIssuing = true;

    try {
      let listOfBets: any = [];
      listOfBets.TicketPrice = 3;

      let apiResponse = await this.machineSrv.issueTicket(listOfBets);
      console.log('issue ticket', apiResponse);
      if (apiResponse.status == false) {
        this.isIssuing = false;
      }
    } catch (err) {
    
    }

  }
}
