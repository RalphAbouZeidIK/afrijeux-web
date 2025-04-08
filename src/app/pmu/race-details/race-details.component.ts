import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
    selector: 'app-race-details',
    templateUrl: './race-details.component.html',
    styleUrls: ['./race-details.component.scss'],
    standalone: false
})
export class RaceDetailsComponent implements OnInit {

  @Input() courseDetails: any

  selectedTypeOfBet: any = null;

  GameEventId: any

  constructor(
    private cartSrv: CartService,
    private route: ActivatedRoute,
    private gamesSrv: GamesService
  ) { }

  async ngOnInit() {
    this.GameEventId = this.route.snapshot.params['eventId']
    this.getCurrentEvent()
  }

  async getCurrentEvent() {
    let gameEventsResponse = await this.gamesSrv.getGameEvents()

    this.courseDetails = gameEventsResponse.GameConfiguration.EventConfiguration.find((item: any) => item.GameEventId == this.GameEventId)

    this.courseDetails.FixedConfiguration = await this.gamesSrv.getFixedConfiguration(this.courseDetails.FixedConfigurationVersion)

    this.courseDetails.horses = []
    for (let index = 0; index < this.courseDetails.HorseNumber; index++) {
      this.courseDetails.horses.push({
        id: index + 1,
        HorseName: (index + 1).toString().padStart(2, '0'),
      })
    }

    this.courseDetails.multiplicator = 1

    console.log(this.courseDetails)


  }

  addToBet(horse: any) {
    horse.isSelected = !horse.isSelected;
    this.setPmuBets();
  }

  chooseBetType(parisItem: any) {
    if (parisItem.isSelected) {
      parisItem.isSelected = false;
    }
    else {

      this.courseDetails.FixedConfiguration.forEach((item: any) => {
        item.isSelected = false;
      });

      parisItem.isSelected = true;
      this.selectedTypeOfBet = parisItem;
    }
    this.courseDetails.multiplicator = 1
    this.setPmuBets();
  }

  setPmuBets() {
    if ((this.courseDetails.horses.find((horse: any) => horse.isSelected == true) == undefined) || (this.courseDetails.FixedConfiguration.find((item: any) => item.isSelected == true) == undefined)) {
      this.courseDetails.showRace = false
    }
    else {
      this.courseDetails.showRace = true
    }
    this.courseDetails.listOfHorses = this.courseDetails.horses.filter((horse: any) => horse.isSelected == true)
    this.courseDetails.selectedFixedConfig = this.courseDetails.FixedConfiguration.find((item: any) => item.isSelected == true)

    this.cartSrv.setPmuBets(this.courseDetails);
  }
}
