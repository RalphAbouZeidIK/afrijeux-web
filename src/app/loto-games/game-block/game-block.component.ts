import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-game-block',
  standalone: false,
  templateUrl: './game-block.component.html',
  styleUrl: './game-block.component.scss'
})
export class GameBlockComponent implements AfterViewInit, OnDestroy {
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

  isJackpotGame = false

  path = this.gnrcSrv.getGameRoute()

  /* height for sidebar cart; calculated from game block size */
  cartHeight = 0;

  @ViewChild('gameBlock') gameBlock!: ElementRef<HTMLElement>;

  fixedConfig: any

  showCart = false

  cartSubscription: Subscription

  constructor(
    private gnrcSrv: GenericService,
    private cartSrv: CartService,
    private gamesSrv: GamesService,
    private storageSrv: LocalStorageService
  ) {

    this.cartSubscription = this.cartSrv.getCartData().subscribe((data: any) => {
      if (data && data.length > 0) {
        this.showCart = true
      }
      else {
        this.showCart = false
      }
    })
  }

  ngOnInit(): void {

    this.generateDisplayBalls();
    this.isPickXGame = window.location.href.includes("PickX")
    this.isJackpotGame = window.location.href.includes("Jackpot")
    console.log(this.isPickXGame)
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    this.getEvents()
    let lotoCartData = this.storageSrv.getItem('lotoCartData')
    if (lotoCartData && lotoCartData.length > 0) {
      this.showCart = true
    }
  }

  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    // measure after view has been rendered
    this.updateCartHeight();

    // observe any size changes of the game block container
    if (typeof ResizeObserver !== 'undefined' && this.gameBlock?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.updateCartHeight());
      this.resizeObserver.observe(this.gameBlock.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCartHeight();
  }

  private updateCartHeight() {
    // use the height of the gameBlock container as reference
    if (this.gameBlock && this.gameBlock.nativeElement) {
      const rect = this.gameBlock.nativeElement.getBoundingClientRect();
      this.cartHeight = rect.height;
    }
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
    // content changed; recalc height in next tick
    setTimeout(() => this.updateCartHeight());

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
    console.log(this.selectedBalls)
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
    if (this.isJackpotGame) {
      // Select 6 random numbers for Jackpot game
      this.selectedNumbers = [];
      const numToSelect = 6;
      while (this.selectedNumbers.length < numToSelect) {
        const randomIndex = Math.floor(Math.random() * this.listOfBalls.length);
        const ball = this.listOfBalls[randomIndex];
        if (!this.selectedNumbers.includes(ball.number)) {
          this.selectedNumbers.push(ball.number);
        }
      }
      // Update listOfBalls to mark selected balls
      this.listOfBalls.forEach(b => b.isSelected = this.selectedNumbers.includes(b.number));
      this.updateLotoPrice()
      this.generateDisplayBalls();
      this.isQuickPick = true;
    }

    else if (this.isPickXGame) {
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

    this.updateLotoPrice()
    this.generateDisplayBalls();
  }

  updateLotoPrice() {

    let numBalls = this.selectedNumbers.length
    if (numBalls >= 6) {
      let priceKey = `Pick${numBalls}Price`;
      let priceItem = this.fixedConfig.find((item: any) => item.Name === priceKey);
      this.Stake = parseFloat(priceItem.Value);

    }
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
    let pickItem: any
    if (this.isPickXGame) {
      console.log(this.selectedType)
      if ((!this.selectedBalls.every((b: any) => b.isSelected)) || this.selectedType == null) {
        alert()
        return
      }

      pickItem = {
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
    }

    else {
      if (this.selectedNumbers.length < 6 || this.selectedNumbers.length > 9) {
        alert()
        return
      }
      this.updateLotoPrice()
      pickItem = {
        IsQuickPick: this.isQuickPick,
        gameEventId: this.selectedEvent.GameEventId,
        eventName: this.selectedEvent.EventName,
        displayBalls: this.selectedBalls.map((b: any) => b.number).join(', '),
        SelectedNumber: this.selectedBalls.map((b: any) => b.number),
        stake: this.Stake,
        id: Math.random().toString(36).substring(2, 9) // generate a random id for the pick
      }
    }


    this.cartSrv.updateLotoList(pickItem)
    this.selectedNumbers = [];
    this.composeEventDetails(this.selectedEvent)
  }
}
