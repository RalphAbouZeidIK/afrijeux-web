import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-prize-details-page',
  standalone: false,
  templateUrl: './prize-details-page.component.html',
  styleUrl: './prize-details-page.component.scss'
})
export class PrizeDetailsPageComponent implements OnInit {
  expandedGame: any = 1;

  games: any = [];

  constructor(private apiSrv: ApiService) { }

  ngOnInit(): void {
    this.getPrizeDetails()
  }

  async getPrizeDetails() {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Corporate/GetPrizeDetails', 'GET', {});

    this.games = apiResponse.PickX
    this.games.forEach((game: any) => {
      game.iconName = `pick${game.NumberOfBalls}.svg`
    });
    
    let jackpotGame = apiResponse.Jackpot
    let counter = 6
    console.log(jackpotGame)
    jackpotGame.forEach((element: any) => {
      element.Hits = counter
      counter--
    });
    this.games.push({
      PickTypeId: jackpotGame.PickTypeId,
      PickTypeName: 'Jackpot',
      NumberOfBalls: 6,
      iconName: 'jackpot.svg',
      TicketTypes: [
        {
          "TicketTypeId": 1,
          "TicketTypeName": "Jackpot",
          "Details": jackpotGame
        }
      ]
    })
    console.log(this.games)
  }

  toggleGame(game: string) {
    this.expandedGame = this.expandedGame === game ? null : game;
  }
}
