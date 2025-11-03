import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-outcomes-page',
  templateUrl: './outcomes-page.component.html',
  styleUrls: ['./outcomes-page.component.scss'],
  standalone: false
})
export class OutcomesPageComponent implements OnInit {
  OutcomesList = []


  MatchDetails: any

  MatchId: any = null

  isFavorite = true

  constructor(
    private gamesSrv: GamesService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {

  }

  ngOnInit(): void {
    //console.log(this.router.url)
    if (this.router.url.includes('EventCodeSearch')) {
      this.getMatchOutcomeFromCode()
    }
    else {
      this.getMatchOutcome()
    }
  }

  async getMatchOutcome() {
    (this.MatchId) ? this.MatchId : this.MatchId = this.route.snapshot.params['matchId']
    let params = {
      Language: 'en',
      MatchId: this.MatchId,
      IsFavorite: this.isFavorite
    }

    ////console.log(params)

    const apiResponse = await this.gamesSrv.getOutcomesListByMatchId(params)
    //console.log(apiResponse)
    if (apiResponse) {
      this.MatchDetails = {
        MatchName: apiResponse[0].MatchName,
        EventDate: apiResponse[0].EventDate,
        EventId: this.MatchId
      }

      this.OutcomesList = apiResponse
    }
  }

  async getMatchOutcomeFromCode() {
    let params = {
      Language: 'en',
      IsFavorite: true,
      EventCode: parseInt(this.route.snapshot.params['eventCode'])
    }
    let apiResponse: any = await this.gamesSrv.getOutcomesListByMatchCode(params)
    //console.log(apiResponse)
    if (apiResponse && apiResponse.length > 0) {
      this.MatchId = apiResponse[0].MatchId
      this.MatchDetails = {
        MatchName: apiResponse[0].MatchName,
        EventDate: apiResponse[0].EventDate,
        EventId: this.MatchId
      }
      this.OutcomesList = apiResponse
    }
    else {
      setTimeout(() => {
        this.location.back()
      }, 4000);
    }
  }
}
