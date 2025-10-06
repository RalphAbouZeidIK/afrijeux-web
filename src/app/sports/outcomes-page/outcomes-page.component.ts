import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-outcomes-page',
  templateUrl: './outcomes-page.component.html',
  styleUrls: ['./outcomes-page.component.scss'],
  standalone: false
})
export class OutcomesPageComponent implements OnInit {
  OutcomesList = []


  MatchDetails: any

  MatchId: any

  constructor(
    private gamesSrv: GamesService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.MatchId = this.route.snapshot.params['matchId']
    this.getMatchOutcome()

  }

  async getMatchOutcome() {
    let params = {
      Language: 'en',
      MatchId: this.MatchId,
    }

    console.log(params)

    const apiResponse = await this.gamesSrv.getOutcomesListByMatchId(params)
    console.log(apiResponse)
    this.MatchDetails = {
      MatchName: apiResponse[0].MatchName,
      EventDate: apiResponse[0].EventDate,
      EventId: this.MatchId
    }

    this.OutcomesList = apiResponse

    console.log(this.MatchDetails)


  }
}
