import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { race } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-game-events',
  templateUrl: './game-events.component.html',
  styleUrls: ['./game-events.component.scss']
})
export class GameEventsComponent implements OnInit {
  PersonId = 8746

  gameId: any

  dataArray: any = [];

  selectedRace: any

  gameObject: any

  constructor(
    private gnrcSrv: GenericService,
    private apiSrv: ApiService,
    private router: Router,
    private gamesSrv: GamesService
  ) { }

  async ngOnInit() {
    await this.getGame()
    this.getGameEvents()
  }

  async getGame() {
    this.gameObject = await this.gnrcSrv.getGameId('PMUHybrid')
    console.log(this.gameObject)
    this.gameId = this.gameObject.gameId
  }

  async getGameEvents() {

    let gameEventsResponse = await this.gamesSrv.getGameEvents()

    const groupedRaces = this.groupByCategory(gameEventsResponse.GameConfiguration.EventConfiguration);

    this.dataArray = Object.values(groupedRaces)

    console.log(this.dataArray)

  }

  groupByCategory(races: any): { ReunionCode: string, races: any }[] {
    // Group races by category
    const grouped = races.reduce((acc: any, race: any) => {
      if (!acc[race.ReunionCode]) {
        acc[race.ReunionCode] = [];
      }
      acc[race.ReunionCode].push(race);
      return acc;
    }, {} as Record<string, any>);

    // Convert the grouped data into the desired format
    return Object.keys(grouped).map(ReunionCode => ({
      ReunionCode,
      races: grouped[ReunionCode],
      ReunionName: ReunionCode
    }));
  }

  redirectToRace(race: any) {
    this.router.navigate([`${this.gnrcSrv.getFirstPathName()}/Events/${race.GameEventId}`])
  }


}
