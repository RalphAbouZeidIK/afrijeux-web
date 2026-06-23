import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-canceled-bets',
  templateUrl: './canceled-bets.component.html',
  styleUrls: ['./canceled-bets.component.scss'],
  standalone:false
})
export class CanceledBetsComponent implements OnInit {
  betsList: any;

  constructor(private apiSrv: ApiService) { }

  ngOnInit(): void {
    this.getCanceledBets();
  }

  async getCanceledBets() {

    try {
      const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', "AfrijeuxSportsBetting/BetsCanceled", "GET", {}, true);
      this.betsList = apiResponse
      //console.log(this.betsList)

    } catch (error) {
      console.warn(error)
    }
  }
}
