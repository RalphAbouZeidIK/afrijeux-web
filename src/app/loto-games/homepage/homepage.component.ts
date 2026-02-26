import { Component } from '@angular/core';
import { race } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  isAndroidApp = false

  eventsList: any = []

  showEventDetails = false

  selectedEvent: any = null

  selectedType: any = null

  maxBalls = 9;              // absolute maximum allowed
  initialBallCount = 6;      // comes from configVersionId

  selectedNumbers: number[] = [];

  selectedBalls: any[] = [];

  listOfBalls: any[] = [];   // your available numbers

  showBallPicker: boolean = false;

  Stake = 0

  multiplier = 1

  ballToChangeId = null

  showConfirmation = false

  isQuickPick = false

  ticketItem: any = []

  isPickXGame = false

  constructor(
    private gnrcSrv: GenericService,
    private machineSrv: MachineService,
    private cartSrv: CartService
  ) { }

  ngOnInit(): void {
    this.generateDisplayBalls();
    this.isPickXGame = window.location.href.includes("PickX")
    console.log(this.isPickXGame)
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    this.getEvents()
  }

  generateDisplayBalls() {

    this.selectedBalls = [];

    // Add selected numbers
    for (let i = 0; i < this.selectedNumbers.length; i++) {
      this.selectedBalls.push({
        number: this.selectedNumbers[i],
        isSelected: true
      });
    }

    // Fill remaining slots up to current visible size
    const visibleSlots = Math.max(
      this.initialBallCount,
      this.selectedNumbers.length
    );

    for (let i = this.selectedBalls.length; i < visibleSlots; i++) {
      this.selectedBalls.push({
        number: 'X',
        isSelected: false
      });
    }
  }

  async getEvents() {
    let gameEventsResponse: any

    if (this.isAndroidApp) {
      gameEventsResponse = await this.machineSrv.getGamesEvents()
      console.log(gameEventsResponse)
      if (gameEventsResponse?.GameConfiguration?.EventConfiguration && gameEventsResponse?.GameConfiguration?.EventConfiguration.length > 0) {
        gameEventsResponse.GameConfiguration.EventConfiguration.forEach((eventItem: any) => {
          if (!eventItem.IsSalesStopped) {
            this.eventsList.push(eventItem)
          }
        });
      }
    }
    console.log(this.eventsList)
  }

  async composeEventDetails(raceItem: any) {
    let configId = (this.isPickXGame) ? raceItem.ConfigurationVersionId : raceItem.FixedConfigurationVersion
    let fixedConfig = await this.machineSrv.getFixedConfiguration(configId)
    let numberOfSelectedBalls = (this.isPickXGame) ? fixedConfig[0].NumberOfBalls : 6
    let numberOfBalls = (this.isPickXGame) ? 10 : fixedConfig.find((item: any) => item.Name === 'NumberOfBalls').Value
    console.log(raceItem)
    console.log(fixedConfig)

    raceItem.fixedConfig = fixedConfig
    this.selectedEvent = raceItem
    this.showEventDetails = true
    this.selectedBalls = this.generateDrawBalls(numberOfSelectedBalls)
    this.listOfBalls = this.generateBallObjects(numberOfBalls)
    console.log(this.listOfBalls)

  }

  generateBallObjects(x: number) {
    return Array.from({ length: x }, (_, i) => ({
      number: (this.isPickXGame) ? i : i + 1,
      selected: false,
      id: (this.isPickXGame) ? i : i + 1
    }));
  }

  generateDrawBalls(configVersionId: any) {
    let drawBalls: any = []
    for (let i = 0; i < configVersionId; i++) {
      drawBalls.push({
        number: 'X',
        id: i,
        isSelected: false
      })
    }
    return drawBalls;
  }

  onTypeChanged(event: any) {
    console.log(event);
    this.selectedType = event
    this.Stake = event.MinStake

  }

  quickPick() {
    this.selectedBalls = this.selectedBalls.map((ball: any) => {
      return { number: Math.floor(Math.random() * 10), id: ball.id, isSelected: true }
    })
    this.showConfirmation = true
    this.isQuickPick = true

    console.log(this.selectedBalls)
  }

  isBallSelected(ball: any): boolean {
    return this.selectedBalls.some((b: any) => b.number === ball.number);
  }

  getSelectedBallsText(): string {
    if (!this.selectedBalls.length) return '';
    return 'Selected Balls: ' + this.selectedBalls.map((b: any) => b.number).join(', ');
  }

  chooseNumber(ball: any) {
    console.log(ball)
    this.ballToChangeId = ball.id
    this.showBallPicker = true
  }

  selectBall(ball: any) {
    this.isQuickPick = false

    if (this.isPickXGame) {
      this.selectPickXBall(ball)
    }
    else {
      this.selectLotoBall(ball)
    }
    console.log(this.selectedBalls)
  }

  selectPickXBall(ball: any) {
    const index = this.selectedBalls.findIndex((b: any) => b.id === this.ballToChangeId);
    this.selectedBalls[index] = { ...ball, isSelected: true, id: this.ballToChangeId };
    this.showConfirmation = this.selectedBalls.every((b: any) => b.isSelected);
    this.showBallPicker = false;    // hide the ball list after selection
  }

  selectLotoBall(ball: any) {

    const index = this.selectedNumbers.indexOf(ball.number);

    // ✅ REMOVE if already selected
    if (index !== -1) {
      this.selectedNumbers.splice(index, 1);
      ball.isSelected = false;
    }

    // ❌ ADD if not selected
    else if (this.selectedNumbers.length < this.maxBalls) {
      this.selectedNumbers.push(ball.number);
      ball.isSelected = true;
    }

    this.generateDisplayBalls();
  }

  updateMultiplier(isAdd: boolean) {
    if (isAdd) {
      if (this.Stake >= this.selectedType.MaxStake) {
        alert('Maximum stake reached')
        return
      }
      else {
        this.Stake += 1
      }
    }

    else {
      if (this.Stake <= this.selectedType.MinStake) {
        alert('Minimum stake reached')
        return
      }
      else {
        this.Stake -= 1
      }
    }
  }

  addToBet() {
    let pickItem = {
      pickTypeId: this.selectedType.PickTypeId,
      pickTypeName: this.selectedType.PickTypeName,
      ticketTypeId: this.selectedType.TicketTypeId,
      ticketTypeName: this.selectedType.TicketTypeName,
      IsQuickPick: this.isQuickPick,
      gameEventId: this.selectedEvent.GameEventId,
      eventName: this.selectedEvent.EventName,
      displayBalls: this.selectedBalls.map((b: any) => b.number).join(', '),
      Balls: this.selectedBalls.map((b: any) => b.number).join('+'),
      stake: this.Stake,
      id: Math.random().toString(36).substring(2, 9) // generate a random id for the pick
    }
    this.cartSrv.updateLotoList(pickItem)
    this.selectedBalls = []
    this.selectedType = null
    this.showConfirmation = false
    this.isQuickPick = false
    this.selectedBalls = this.generateDrawBalls(this.selectedEvent.ConfigurationVersionId)
    console.log(this.ticketItem)
    console.log(pickItem)
  }

}

