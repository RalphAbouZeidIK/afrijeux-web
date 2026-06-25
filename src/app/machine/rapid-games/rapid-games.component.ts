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

  games = [
    { rapidGameType: 'Fruits', isRapid: true, title: 'Rapid Fruits', imageUrl: 'assets/images/rapid-fruits-banner.jpg' },
    { rapidGameType: 'Animals', isRapid: true, title: 'Rapid Animals', imageUrl: 'assets/images/rapid-animals-banner.jpg' },
    { rapidGameType: 'Football', isRapid: true, title: 'Rapid Football', imageUrl: 'assets/images/rapid-football-banner-new.jpeg' },
    { rapidGameType: 'Luxury', isRapid: true, title: 'Rapid Luxury', imageUrl: 'assets/images/rapid-luxury-banner.jpg' },
    { rapidGameType: 'Emojis', isRapid: true, title: 'Rapid Emojis', imageUrl: 'assets/images/rapid-emojis-banner.jpg' },
    { rapidGameType: 'Numbers', isRapid: true, title: 'Mega Win', imageUrl: 'assets/images/mega-win-banner-new.jpeg' },
    { rapidGameType: 'NumbersLite', isRapid: true, title: 'Quick Match', imageUrl: 'assets/images/quick-match-banner-new.jpeg' },
    { rapidGameType: 'Keno', isRapid: false, title: 'Keno Games', imageUrl: 'assets/images/keno-banner.jpg' },
  ];

  get currentGame() {
    const key = this.isKeno ? 'Keno' : this.rapidGameType;
    return this.games.find(g => g.rapidGameType === key);
  }

  get gameTitle(): string {
    return this.currentGame?.title ?? '';
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
    this.router.navigate(['/Machine/InstantGames'], { queryParams: { normalGamesShown: false } });
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
