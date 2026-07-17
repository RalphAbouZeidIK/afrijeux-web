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
    { rapidGameType: 'Football', isRapid: true, title: 'Rapid Football', imageUrl: 'assets/images/rapid-football-banner-.jpg' },
    { rapidGameType: 'Luxury', isRapid: true, title: 'Rapid Luxury', imageUrl: 'assets/images/rapid-luxury-banner.jpg' },
    { rapidGameType: 'Emojis', isRapid: true, title: 'Rapid Emojis', imageUrl: 'assets/images/rapid-emojis-banner.jpg' },
    { rapidGameType: 'Numbers', isRapid: true, title: 'Mega Win', imageUrl: 'assets/images/mega-win-banner-.jpg' },
    { rapidGameType: 'NumbersLite', isRapid: true, title: 'Quick Match', imageUrl: 'assets/images/quick-match-banner-.jpg' },
    { rapidGameType: 'Keno', isRapid: false, title: 'Keno Games', imageUrl: 'assets/images/keno-banner.jpg' },
  ];

  get currentGame() {
    const key = this.isKeno ? 'Keno' : this.rapidGameType;
    return this.games.find(g => g.rapidGameType === key);
  }

  get gameTitle(): string {
    return this.currentGame?.title ?? '';
  }

  // Same folder/range convention the Flutter print side uses (see _iconFolderFor
  // in print_text_page.dart) so the web picker and the printed ticket stay in sync.
  private iconConfigByGameType: Record<string, { folder: string; min: number; max: number }> = {
    Fruits: { folder: 'fruit_icons', min: 1, max: 60 },
    Animals: { folder: 'animal_icons', min: 1, max: 60 },
    Football: { folder: 'football_icons', min: 1, max: 50 },
    Luxury: { folder: 'luxury_icons', min: 1, max: 40 },
    Emojis: { folder: 'emoji_icons', min: 1, max: 40 },
    Numbers: { folder: 'number_icons', min: 1, max: 90 },
    NumbersLite: { folder: 'number_icons', min: 1, max: 40 },
  };

  get currentIconConfig() {
    return this.iconConfigByGameType[this.rapidGameType] ?? this.iconConfigByGameType['Animals'];
  }

  get availableNumbers(): number[] {
    const { min, max } = this.currentIconConfig;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  showIconPicker = false;

  iconPath(n: number): string {
    return `assets/rapid-icons/${this.currentIconConfig.folder}/${n}.png`;
  }

  readonly maxPicks = 5;

  // Empty by default: "Generate & Print" issues the usual random Quick Pick ticket.
  // Only picking exactly maxPicks numbers here switches it to a player-chosen ticket.
  selectedNumbers: number[] = [];

  isSelected(n: number): boolean {
    return this.selectedNumbers.includes(n);
  }

  toggleNumber(n: number) {
    const index = this.selectedNumbers.indexOf(n);
    if (index > -1) {
      this.selectedNumbers.splice(index, 1);
    } else if (this.selectedNumbers.length < this.maxPicks) {
      this.selectedNumbers.push(n);
    }
  }

  clearSelection() {
    this.selectedNumbers = [];
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

    if (this.selectedNumbers.length > 0 && this.selectedNumbers.length !== this.maxPicks) {
      this.gnrcSrv.setModalData(true, false, `Please pick ${this.maxPicks} numbers, or clear your selection for Quick Pick.`);
      return;
    }

    this.isIssuing = true;

    try {
      let listOfBets: any = [];
      listOfBets.TicketPrice = 3;
      if (this.selectedNumbers.length === this.maxPicks) {
        listOfBets.SelectedNumbers = this.selectedNumbers;
      }
      let apiResponse = await this.machineSrv.issueTicket(listOfBets);
      console.log('issue ticket', apiResponse);
      if (apiResponse.status == false) {
        this.isIssuing = false;
      } else {
        this.selectedNumbers = [];
      }
    } catch (err) {

    }

  }
}
