import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-apitesting',
    templateUrl: './apitesting.component.html',
    styleUrls: ['./apitesting.component.scss'],
    standalone: false
})

export class ApitestingComponent implements OnInit {
  addOdd(_t60: any) {
    throw new Error('Method not implemented.');
  }
 
  redirectTo(_t21: any) {
    throw new Error('Method not implemented.');
  }

  matchesList: any = []

  filtersList: any = {
    Sports: []
  };

  constructor(private apiSrv: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getSports()
  }

  async getSports() {
    const route = 'oddscomparison-ust1/en/eu/sports.json?api_key=yJ3EdEl4DZzy4qUcwd5nE8qbwGRfKzpPrclI1Ufm';  // relative path
    const apiResponse = await this.apiSrv.oddsapi(route, 'GET');
    this.filtersList.sports = apiResponse.sports;
    console.log(this.filtersList)
  }

  async getCategories(sportItem: any) {
    const route = `oddscomparison-ust1/en/eu/sports/${sportItem.id}/categories.json?api_key=yJ3EdEl4DZzy4qUcwd5nE8qbwGRfKzpPrclI1Ufm`;  // relative path
    const apiResponse = await this.apiSrv.oddsapi(route, 'GET');
    sportItem.categories = apiResponse.categories;
    console.log(sportItem)
  }

  async getTournaments(sportItem: any) {
    const route = `oddscomparison-ust1/en/eu/sports/${sportItem.id}/tournaments.json?api_key=yJ3EdEl4DZzy4qUcwd5nE8qbwGRfKzpPrclI1Ufm`
    const apiResponse = await this.apiSrv.oddsapi(route, 'GET');
    sportItem.tournaments = apiResponse.tournaments;
    sportItem.categories.forEach((category: any) => {
      category.tournaments = sportItem.tournaments.filter((tournament: any) => tournament.category.id == category.id)
    })
    console.log(sportItem)
  }

  async getMatchesBySport(sportItem: any) {
    const route = `oddscomparison-ust1/en/eu/sports/${sportItem.id}/2025-02-12/schedule.json?api_key=yJ3EdEl4DZzy4qUcwd5nE8qbwGRfKzpPrclI1Ufm`;  // relative path
    const apiResponse = await this.apiSrv.oddsapi(route, 'GET');
    this.matchesList = apiResponse.sport_events;
    console.log(this.matchesList)
  }

  async getTournamentSchedule(tounrament: any) {
    const route = `oddscomparison-ust1/en/eu/tournaments/${tounrament.id}/schedule.json?api_key=yJ3EdEl4DZzy4qUcwd5nE8qbwGRfKzpPrclI1Ufm`;  // relative path
    const apiResponse = await this.apiSrv.oddsapi(route, 'GET');
    this.matchesList = apiResponse.sport_events;
    console.log(this.matchesList)
  }
  
  getOutcomes(_t49: any) {
    throw new Error('Method not implemented.');
  }

  async getOdds(eventItem: any) {
    console.log(eventItem)

    const route = `oddscomparison-ust1/en/eu/sport_events/${eventItem.id}/markets.json?api_key=yJ3EdEl4DZzy4qUcwd5nE8qbwGRfKzpPrclI1Ufm`;  // relative path
    const apiResponse = await this.apiSrv.oddsapi(route, 'GET');
    console.log(apiResponse)
  }
}
