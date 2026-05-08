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

  groupData(data: any[]) {
    const games: any = {};

    data.forEach(item => {
      const gameId = item.GameId;

      // Create game group
      if (!games[gameId]) {
        games[gameId] = {
          gameId: gameId,
          gameName: item.GameName,
          ticketTypes: []
        };
      }

      const game = games[gameId];

      // Case 1: No TicketTypeId → always index 0
      if (!item.TicketTypeId) {
        if (!game.ticketTypes[0]) {
          game.ticketTypes[0] = {
            ticketTypeId: null,
            items: []
          };
        }
        game.ticketTypes[0].items.push(item);
        return;
      }

      // Case 2: Has TicketTypeId
      let group = game.ticketTypes.find(
        (t: any) => t && t.ticketTypeId === item.TicketTypeId
      );

      if (!group) {
        group = {
          ticketTypeId: item.TicketTypeId,
          items: []
        };
        game.ticketTypes.push(group);
      }

      group.items.push(item);
    });

    return Object.values(games);
  }
  async getPrizeDetails() {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Corporate/GetPrizeDetails', 'GET', {});
    this.games = this.groupData(apiResponse);
    //console.log(this.games)
    this.games.forEach((game: any) => {
      game.iconName = game.gameId === 66 ? 'pick3' : game.gameId === 67 ? 'pick4' : game.gameId === 68 ? 'pick5' : 'jackpot';
      game.iconName = `${game.iconName}.svg`
    });

    this.toggleGame(this.games[0].gameId)
    //console.log(this.games)
  }

  toggleGame(game: string) {
    this.expandedGame = this.expandedGame === game ? null : game;
  }
}
