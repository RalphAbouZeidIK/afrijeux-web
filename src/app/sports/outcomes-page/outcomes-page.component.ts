import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-outcomes-page',
  templateUrl: './outcomes-page.component.html',
  styleUrls: ['./outcomes-page.component.scss']
})
export class OutcomesPageComponent implements OnInit {
  outcomesList = []


  matchDetails: any

  matchId: any

  constructor(private apiSrv: ApiService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.matchId = this.route.snapshot.params['matchId']
    this.getMatchOutcome()

  }

  async getMatchOutcome() {
    let params = {
      Language: 'en',
      MatchId: this.matchId,
    }

    console.log(params)

    const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', 'AfrijeuxSportsBetting/GetOutcomesListByMatchId', 'POST', params)
    console.log(apiResponse)
    this.matchDetails = {
      MatchName: apiResponse[0].MatchName,
      EventDate: apiResponse[0].EventDate,
      EventId: this.matchId
    }

    this.outcomesList = apiResponse

    console.log(apiResponse)


  }
}
