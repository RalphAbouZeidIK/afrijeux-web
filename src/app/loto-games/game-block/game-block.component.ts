import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { CartComponent } from 'src/app/shared/cart/cart.component';

@Component({
  selector: 'app-game-block',
  standalone: false,
  templateUrl: './game-block.component.html',
  styleUrl: './game-block.component.scss'
})
export class GameBlockComponent implements AfterViewInit, OnDestroy, OnChanges {

  selectedGameEventId: number | null = null

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
  @ViewChild('sharedCart') sharedCart?: CartComponent;

  fixedConfig: any

  showCart = false

  cartSubscription: Subscription

  selectedResultFilter: string | number | null = 1;

  showOptionsList = false

  isBulkIssueInProgress = false

  isBulkSeparateIssueInProgress = false

  isAndroidApp = this.gnrcSrv.isMachineApp()

  @Input() allEvents: any = []

  countdownTime: string = ''

  private configCache = new Map<number, any>()
  private countdownSubscription: Subscription | null = null
  private destroy$ = new Subject<void>()

  constructor(
    private gnrcSrv: GenericService,
    private cartSrv: CartService,
    private gamesSrv: GamesService,
    private route: ActivatedRoute
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
    this.getEvents()
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges triggered');
    // Only re-process if allEvents reference has changed (avoids redundant API calls)
    if (changes['allEvents'] && changes['allEvents'].currentValue !== changes['allEvents'].previousValue) {
      this.getEvents();
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
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
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
    console.log(this.allEvents)
    let gameEventsResponse = (this.isPickXGame) ? this.allEvents?.pickXGames : this.allEvents?.jackpotGames;
    console.log(gameEventsResponse)
    if (gameEventsResponse != null && gameEventsResponse !== undefined) {
      gameEventsResponse.forEach((eventItem: any) => {
        if (!eventItem.IsSalesStopped) {
          this.eventsList.push(eventItem)
        }
      });

      if (this.eventsList.length > 0) {
        let selectedEvent = this.eventsList[0];

        if (this.isPickXGame) {
          const gameEventId = this.route.snapshot.queryParamMap.get('gameEventId');
          const legacyGameType = this.route.snapshot.queryParamMap.get('gametype');

          if (gameEventId) {
            this.selectedGameEventId = Number(gameEventId);
            const matchedEvent = this.eventsList.find(
              (eventItem: any) => Number(eventItem?.GameEventId) === Number(gameEventId)
            );
            if (matchedEvent) {
              selectedEvent = matchedEvent;
            }
          } else if (legacyGameType) {
            // Backward compatibility for old links that still pass gametype.
            const matchedEvent = this.eventsList.find(
              (eventItem: any) => Number(eventItem?.ConfigurationVersionId) === Number(legacyGameType)
            );
            if (matchedEvent) {
              selectedEvent = matchedEvent;
            }
          }
        }

        this.composeEventDetails(selectedEvent)
      }
    }
    else {
      this.showEventDetails = false
    }
    console.log(this.eventsList)
  }

  async composeEventDetails(raceItem: any) {
    let configId = (this.isPickXGame) ? raceItem.ConfigurationVersionId : raceItem.FixedConfigurationVersion
    if (this.configCache.has(configId)) {
      this.fixedConfig = this.configCache.get(configId);
    } else {
      this.fixedConfig = await this.gamesSrv.getFixedConfig(configId)
      this.configCache.set(configId, this.fixedConfig);
    }
    let numberOfSelectedBalls = (this.isPickXGame) ? this.fixedConfig[0].NumberOfBalls : 6
    let numberOfBalls = (this.isPickXGame) ? 10 : this.fixedConfig.find((item: any) => item.Name === 'NumberOfBalls').Value
    console.log(raceItem)
    console.log(this.fixedConfig)

    raceItem.fixedConfig = this.fixedConfig
    this.selectedEvent = raceItem
    if (this.isPickXGame) {
      this.selectedGameEventId = Number(raceItem?.GameEventId);
    }

    const lotoCartData = this.cartSrv.getCurrentLotoCartData(this.selectedEvent);
    this.showCart = Array.isArray(lotoCartData) && lotoCartData.length > 0;

    this.showEventDetails = true
    // content changed; recalc height in next tick
    setTimeout(() => this.updateCartHeight());

    // if we have bet types available and none chosen yet, pick the first one
    if (this.isPickXGame && this.fixedConfig && this.fixedConfig.length) {
      this.selectedType = this.fixedConfig[0];
      this.onTypeChanged(this.selectedType);
    }

    this.selectedBalls = this.generateDrawBalls(numberOfSelectedBalls)
    this.listOfBalls = this.generateBallObjects(numberOfBalls)
    // reset the per-slot selection array
    this.slotSelections = new Array(numberOfSelectedBalls).fill(null);
    console.log(this.listOfBalls)
    console.log(this.selectedBalls)

    // Start countdown timer for this event
    this.startCountdown(raceItem);
  }

  private startCountdown(event: any): void {
    // Stop existing countdown if any
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    // Start new countdown
    this.countdownSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateCountdown(event);
      });

    // Calculate immediately
    this.updateCountdown(event);
  }

  private updateCountdown(event: any): void {
    const eventDate = new Date(event.EventDate || event.GameEventDate);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownTime = 'Event started';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    this.countdownTime = parts.join(' ');
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


  onFilterChange(option: any) {
    console.log(option)
    this.selectedType = option
    this.Stake = option.MinStake
    this.clampStakeToTypeLimits()
    this.selectedResultFilter = option.TicketTypeId;
    console.log('filter', option.TicketTypeId);
  }

  onTypeChanged(event: any) {
    console.log(event);
    this.selectedType = event
    this.Stake = event.MinStake
    this.clampStakeToTypeLimits()

  }

  onStakeInputChange(value: any, inputEl?: HTMLInputElement) {
    const parsedValue = Number(value);
    this.Stake = Number.isFinite(parsedValue) ? parsedValue : 0;
    this.clampStakeToTypeLimits();

    // Keep the DOM input in sync with the clamped model value so extra typing
    // does not append digits after the limit is reached.
    if (inputEl) {
      inputEl.value = String(this.Stake);
    }
  }

  private clampStakeToTypeLimits() {
    if (!this.selectedType) {
      return;
    }

    const minStake = Number(this.selectedType.MinStake);
    const maxStake = Number(this.selectedType.MaxStake);

    if (!Number.isFinite(minStake) || !Number.isFinite(maxStake)) {
      return;
    }

    if (this.Stake < minStake) {
      this.gnrcSrv.setModalData(true, false, `Minimum stake for this bet type is ${minStake}.`)
      this.Stake = minStake;
      return;
    }

    if (this.Stake > maxStake) {
      this.gnrcSrv.setModalData(true, false, `Maximum stake for this bet type is ${maxStake}.`)
      this.Stake = maxStake;
    }
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
      this.currentPickIndex = this.selectedBalls.length

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

  selectBall(ball: any) {
    this.isQuickPick = false

    if (this.isPickXGame) {
      // record the choice for that slot so the corresponding child component
      // can highlight it
      this.selectPickXBall(ball)
    }
    else {
      this.selectLotoBall(ball)
    }
    console.log(this.selectedBalls)
  }

  currentPickIndex = 0;
  selectPickXBall(ball: any) {
    // If all slots are filled → stop or reset (your choice)
    if (this.currentPickIndex >= this.slotSelections.length) {
      return;
    }

    // assign ball to current slot
    this.slotSelections[this.currentPickIndex] = ball;

    this.selectedBalls[this.currentPickIndex] = {
      ...ball,
      isSelected: true,
      id: this.currentPickIndex
    };

    // move to next slot
    this.currentPickIndex++;

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

  deleteLastBall() {
    // nothing to delete
    if (this.currentPickIndex === 0) return;

    // move back to previous slot
    this.currentPickIndex--;

    // clear that slot
    this.slotSelections[this.currentPickIndex] = null;

    this.selectedBalls[this.currentPickIndex] = {
      number: 'X',
      id: this.currentPickIndex,
      isSelected: false
    };

    console.log(this.selectedBalls);
  }

  deleteLastLotoBall() {
    if (this.selectedNumbers.length === 0) return;

    // get last selected number
    const lastNumber = this.selectedNumbers[this.selectedNumbers.length - 1];

    // remove it from array
    this.selectedNumbers.pop();

    // find the ball object and unselect it
    const ball = this.listOfBalls.find(b => b.number === lastNumber);
    if (ball) {
      ball.isSelected = false;
    }

    this.updateLotoPrice();
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
    this.Stake += isAdd ? 1 : -1
    this.clampStakeToTypeLimits()
  }

  private getGameNameForBet(): string {
    if (this.isJackpotGame) {
      return 'Jackpot';
    }

    const configId = Number(this.selectedEvent?.ConfigurationVersionId);
    if (this.isPickXGame && !Number.isNaN(configId)) {
      return `Pick${configId}`;
    }

    return 'Jackpot';
  }

  addToBet(refreshEventDetails = true) {
    this.currentPickIndex = 0; // reset for next time
    let pickItem: any
    const gameName = this.getGameNameForBet();

    if (this.isPickXGame) {
      console.log(this.selectedType)
      if ((!this.selectedBalls.every((b: any) => b.isSelected)) || this.selectedType == null) {
        this.gnrcSrv.setModalData(true, false, 'Please select all balls and a type.');
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
        gameName: gameName,
        stake: this.Stake,
        id: Math.random().toString(36).substring(2, 9) // generate a random id for the pick
      }
    }

    else {
      if (this.selectedNumbers.length < 6 || this.selectedNumbers.length > 9) {
        this.gnrcSrv.setModalData(true, false, 'Please select between 6 and 9 balls.');
        return
      }
      this.updateLotoPrice()
      pickItem = {
        IsQuickPick: this.isQuickPick,
        gameEventId: this.selectedEvent.GameEventId,
        eventName: this.selectedEvent.EventName,
        displayBalls: this.selectedBalls.map((b: any) => b.number).join(', '),
        SelectedNumber: this.selectedBalls.map((b: any) => b.number),
        gameName: gameName,
        stake: this.Stake,
        id: Math.random().toString(36).substring(2, 9) // generate a random id for the pick
      }
    }
    console.log(pickItem)
    this.Stake = 0
    this.cartSrv.updateLotoList(pickItem)
    this.selectedNumbers = [];
    if (refreshEventDetails) {
      this.composeEventDetails(this.selectedEvent)
    }
  }

  async issue100Tickets() {
    if (this.isBulkIssueInProgress || !this.selectedEvent) {
      return;
    }

    this.isBulkIssueInProgress = true;

    try {
      for (let i = 0; i < 100; i++) {
        this.quickPick();

        if (this.isPickXGame && this.selectedType) {
          this.Stake = Number(this.selectedType.MinStake) || 0;
        } else if (this.isJackpotGame) {
          this.updateLotoPrice();
        }

        this.addToBet(false);
      }

      this.composeEventDetails(this.selectedEvent);
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!this.sharedCart) {
        this.gnrcSrv.setModalData(true, false, 'Cart is not ready yet. Please try again.');
        return;
      }

      await this.sharedCart.issueTicket();
    }
    finally {
      this.isBulkIssueInProgress = false;
    }
  }

  async issue100TicketsSeparately() {
    if (this.isBulkSeparateIssueInProgress || !this.selectedEvent) {
      return;
    }

    this.isBulkSeparateIssueInProgress = true;

    try {
      const initialCartReady = await this.waitForSharedCart();
      if (initialCartReady && !this.sharedCart?.isLoggedIn) {
        await this.sharedCart!.issueTicket();
        return;
      }

      for (let i = 0; i < 100; i++) {
        this.quickPick();

        if (this.isPickXGame && this.selectedType) {
          this.Stake = Number(this.selectedType.MinStake) || 0;
        } else if (this.isJackpotGame) {
          this.updateLotoPrice();
        }

        this.addToBet(false);
        const cartReady = await this.waitForSharedCart();
        if (!cartReady) {
          this.gnrcSrv.setModalData(true, false, 'Cart is not ready yet. Please try again.');
          return;
        }

        await this.sharedCart!.issueTicket();
      }

      this.composeEventDetails(this.selectedEvent);
    }
    finally {
      this.isBulkSeparateIssueInProgress = false;
    }
  }

  private async waitForSharedCart(maxRetries = 30, delayMs = 50): Promise<boolean> {
    for (let retry = 0; retry < maxRetries; retry++) {
      if (this.sharedCart) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return false;
  }
}
