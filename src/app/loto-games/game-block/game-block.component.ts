import { Component } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-game-block',
  standalone:false,
  templateUrl: './game-block.component.html',
  styleUrl: './game-block.component.scss'
})
export class GameBlockComponent {
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

  // store the currently chosen ball for each pickX slot so we can tell the
  // corresponding `app-ball-list` which ball should be highlighted
  slotSelections: any[] = [];

  showBallPicker: boolean = false;

  Stake = 0

  multiplier = 1

  ballToChangeId = null


  isQuickPick = false

  ticketItem: any = []

  isPickXGame = false

  path = this.gnrcSrv.getGameRoute()

  fixedConfig: any

  constructor(
    private gnrcSrv: GenericService,
    private cartSrv: CartService,
    private gamesSrv: GamesService
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
    let gameEventsResponse = await this.gamesSrv.getGamesEvents()
    console.log(gameEventsResponse)
    gameEventsResponse.forEach((eventItem: any) => {
      if (!eventItem.IsSalesStopped) {
        this.eventsList.push(eventItem)
        this.composeEventDetails(this.eventsList[0])
      }
    });
    console.log(this.eventsList)
  }

  async composeEventDetails(raceItem: any) {
    let configId = (this.isPickXGame) ? raceItem.ConfigurationVersionId : raceItem.FixedConfigurationVersion
    let fixedConfig = await this.gamesSrv.getFixedConfig(configId)
    this.fixedConfig = fixedConfig
    let numberOfSelectedBalls = (this.isPickXGame) ? fixedConfig[0].NumberOfBalls : 6
    let numberOfBalls = (this.isPickXGame) ? 10 : fixedConfig.find((item: any) => item.Name === 'NumberOfBalls').Value
    console.log(raceItem)
    console.log(fixedConfig)

    raceItem.fixedConfig = fixedConfig
    this.selectedEvent = raceItem
    this.showEventDetails = true

    // if we have bet types available and none chosen yet, pick the first one
    if (this.isPickXGame && fixedConfig && fixedConfig.length) {
      this.selectedType = fixedConfig[0];
      this.onTypeChanged(this.selectedType);
    }

    this.selectedBalls = this.generateDrawBalls(numberOfSelectedBalls)
    this.listOfBalls = this.generateBallObjects(numberOfBalls)
    // reset the per-slot selection array
    this.slotSelections = new Array(numberOfSelectedBalls).fill(null);
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

  /**
   * Helper to convert a numeric count into an iterable array suitable for
   * `*ngFor`. Usage in template: `*ngFor="let _ of range(fixedConfig[0].NumberOfBalls)"`
   */
  range(count: number): any[] {
    if (!count || count < 0) {
      return [];
    }
    return Array.from({ length: count });
  }

  onTypeChanged(event: any) {
    console.log(event);
    this.selectedType = event
    this.Stake = event.MinStake

  }

  quickPick() {
    // choose a random ball from the available list for each slot
    this.selectedBalls = this.selectedBalls.map((ball: any, idx: number) => {
      const randomIndex = Math.floor(Math.random() * this.listOfBalls.length);
      const pick = this.listOfBalls[randomIndex];
      // record in slotSelections so the correct component highlights it
      this.slotSelections[idx] = pick;
      return { ...pick, isSelected: true, id: ball.id };
    });

    // also mark the picked balls as selected in listOfBalls if desired
    this.listOfBalls = this.listOfBalls.map(b => ({ ...b, selected: false }));
    this.slotSelections.forEach((p: any) => {
      const found = this.listOfBalls.find(b => b.id === p?.id);
      if (found) {
        found.selected = true;
      }
    });

    this.isQuickPick = true;

    console.log(this.selectedBalls);
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

  selectBall(ball: any, index = 0) {
    this.isQuickPick = false

    if (this.isPickXGame) {
      // record the choice for that slot so the corresponding child component
      // can highlight it
      this.selectPickXBall(ball, index)
    }
    else {
      this.selectLotoBall(ball)
    }
    console.log(this.selectedBalls)
  }

  selectPickXBall(ball: any, index: any) {
    console.log(ball);
    // if this slot already has the same ball selected, deselect it
    const currently = this.slotSelections[index];
    if (currently && currently.id === ball.id) {
      this.slotSelections[index] = null;
      // mark as unselected placeholder
      this.selectedBalls[index] = { number: 'X', id: index, isSelected: false };
    } else {
      this.slotSelections[index] = ball;
      this.selectedBalls[index] = { ...ball, isSelected: true, id: this.ballToChangeId };
    }

    this.showBallPicker = false;    // hide the ball list after selection
    console.log(this.selectedBalls);
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
    if (this.isPickXGame) {
      console.log(this.selectedType)
      if ((!this.selectedBalls.every((b: any) => b.isSelected)) || this.selectedType == null) {
        alert()
        return
      }
    }

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
    this.slotSelections = []
    this.selectedBalls = []
    this.selectedType = this.fixedConfig[0];
    this.isQuickPick = false
    this.selectedBalls = this.generateDrawBalls(this.selectedEvent.ConfigurationVersionId)
    console.log(this.ticketItem)
    console.log(pickItem)
  }
}
