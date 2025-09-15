import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-outcomes-page',
  templateUrl: './outcomes-page.component.html',
  styleUrls: ['./outcomes-page.component.scss'],
  standalone: false
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
      body: {
        Language: 'en',
        MatchId: this.matchId,
      }
    }

    console.log(params)

    const apiResponse = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetOutcomesListByMatchId', 'POST', params)
    console.log(apiResponse)
    this.matchDetails = {
      matchName: apiResponse[0].matchName,
      eventDate: apiResponse[0].eventDate,
      eventId: this.matchId
    }

    this.outcomesList = apiResponse

    console.log(this.matchDetails)


  }
}
