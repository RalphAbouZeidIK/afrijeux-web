import { Component, OnInit } from '@angular/core';
import { race } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  standalone: false
})
export class HomepageComponent implements OnInit {
  isAndroidApp = false

  eventsList: any = []

  showEventDetails = false

  selectedEvent: any = null

  selectedNap: any = null

  listOfBalls: any = []

  selectedBalls: any = []

  showBallPicker: boolean = false;

  Stake = 0

  multiplier = 1

  constructor(
    private gnrcSrv: GenericService,
    private machineSrv: MachineService
  ) { }

  ngOnInit(): void {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    this.getEvents()
  }

  async getEvents() {
    let gameEventsResponse: any

    if (this.isAndroidApp) {
      gameEventsResponse = await this.machineSrv.getKhamsaEvents()
      console.log(gameEventsResponse)
      if (gameEventsResponse?.GameConfiguration?.EventConfiguration && gameEventsResponse?.GameConfiguration?.EventConfiguration.length > 0) {
        gameEventsResponse.GameConfiguration.EventConfiguration.forEach((eventItem: any) => {
          if (!eventItem.IsSalesStopped) {
            this.eventsList.push(eventItem)
          }
        });
      }
    }
  }

  async composeEventDetails(raceItem: any) {
    let fixedConfig = await this.machineSrv.getFixedConfiguration(raceItem.FixedConfigurationId)
    let groupedFixedConfig = this.groupGameSettings(fixedConfig)
    raceItem.fixedConfig = groupedFixedConfig
    this.selectedEvent = raceItem
    this.showEventDetails = true
    this.listOfBalls = this.generateBallObjects(90)
    console.log(this.listOfBalls)
  }

  groupGameSettings(settings: any) {
    const grouped: any = {};

    Object.keys(settings).forEach(key => {
      // Match: IsNap1Allowed  OR  Nap1MinimumStake
      const match = key.match(/^(Is)?(Nap|Perm|Banker|Turbo)(\d+)(.*)$/);
      if (!match) return;

      const [, isPrefix, category, number, property] = match;

      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][number]) grouped[category][number] = {};

      // Set unique Id: Nap1
      grouped[category][number]["Id"] = `${category}${number}`;

      // balls value
      grouped[category][number]["balls"] = Number(number);

      // Allowed handler
      if (property === "Allowed" && isPrefix === "Is") {
        grouped[category][number]["IsAllowed"] = settings[key];
        return;
      }

      // Normal property
      if (!isPrefix) {
        grouped[category][number][property] = settings[key];
      }
    });

    // 🔥 Convert each category object → array
    const finalResult: any = {};
    Object.keys(grouped).forEach(category => {
      finalResult[category] = Object.keys(grouped[category])
        .sort((a, b) => Number(a) - Number(b)) // ensure order 1,2,3,4...
        .map(number => grouped[category][number]);
    });

    return finalResult;
  }

  onNapChange(napItem: any) {
    this.selectedNap = napItem
    this.selectedBalls = []
    this.Stake = this.selectedNap.MinimumStake
    this.multiplier = 1
    console.log(this.selectedNap)
  }

  generateBallObjects(x: number) {
    return Array.from({ length: x }, (_, i) => ({
      number: i + 1,
      selected: false
    }));
  }

  generateUniqueRandomBalls(totalBalls: number, pickCount: number): number[] {
    const numbers = Array.from({ length: totalBalls }, (_, i) => i + 1);

    // Shuffle using Fisher–Yates
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    return numbers.slice(0, pickCount);
  }

  quickPick() {
    if (!this.selectedNap) return;

    const count = this.selectedNap.balls;
    const totalBalls = this.listOfBalls.length; // Automatically uses your real balls

    // Step 1: generate random numbers
    const randomNumbers = this.generateUniqueRandomBalls(totalBalls, count);

    // Step 2: map numbers to ball objects
    this.selectedBalls = this.listOfBalls
      .filter((ball: any) => randomNumbers.includes(ball.number));
    console.log(this.selectedBalls)
  }

  isBallSelected(ball: any): boolean {
    return this.selectedBalls.some((b: any) => b.number === ball.number);
  }

  getSelectedBallsText(): string {
    if (!this.selectedBalls.length) return '';
    return 'Selected Balls: ' + this.selectedBalls.map((b: any) => b.number).join(', ');
  }


  onChooseNumbers() {
    this.showBallPicker = true;     // show the ball list
  }

  selectBall(ball: number) {
    const maxBalls = this.selectedNap?.balls ?? 0;

    // If ball is already selected → deselect it
    if (this.selectedBalls.includes(ball)) {
      this.selectedBalls = this.selectedBalls.filter((b: any) => b !== ball);
      return;
    }

    // If user already selected the maximum number of balls → do nothing
    if (this.selectedBalls.length >= maxBalls) {
      return; // or show a toast if you want
    }

    // Otherwise, select the ball
    this.selectedBalls.push(ball);
  }

  updateMultiplier(isAdd: boolean) {
    if (this.Stake >= this.selectedNap.MaximumStake && isAdd) {
      alert('Maximum stake reached')
      return
    }
    if (isAdd) {
      this.multiplier += 1
    }
    else {
      if (this.multiplier > 1) {
        this.multiplier -= 1
      }
    }
    this.Stake = this.selectedNap.MinimumStake * this.multiplier
  }

  addToBet(){
    console.log(this.selectedNap)
    console.log(this.selectedBalls)
    let pickItem = {
      BallNumber :this.selectedNap.balls
    }
  }

}
