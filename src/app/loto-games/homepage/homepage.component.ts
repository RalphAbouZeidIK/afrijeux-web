import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlayTypeRule } from '../game-playtypes/game-playtypes.component';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit, OnDestroy {
  shouldRenderContent = true;

  private queryParamsSubscription: Subscription | null = null;
  private hasInitializedQueryParams = false;

  constructor(private route: ActivatedRoute) {}

  overviewParagraphs: string[] = [
    'Pick 2 is a simple and exciting lottery-style game where players select a two-digit combination (each digit from 0 to 9). The game allows repetition of digits.',
    'Players may place bets using several play types: Straight, Rumble, Chance, or Reverse Straight. Each type has its own rules and payout structure.'
  ];

  howtoSteps: string[] = [
    'Choose Your Numbers: Select any two digits from 0 to 9 (digits may be repeated).',
    'Select a Play Type: Choose Straight, Rumble, Chance.',
    'Purchase Your Ticket: Confirm your selection and pay the ticket cost.',
    'Check the Draw: Match your numbers based on the selected play type.'
  ];

  playTypeRules: PlayTypeRule[] = [
    {
      name: 'Straight',
      description: [
        'Win if your numbers match the winning numbers in the exact order drawn.',
        'Example: If you play 1-2, you win only if the result is 1-2.',
        'Payout: 60× your bet.'
      ]
    },
    {
      name: 'Chance (Right-to-Left Match)',
      description: [
        'You win if one or more digits of your selection match the draw result from right to left, in the correct order.',
        'Hit 1: Only the last digit matches. Result pattern: x-2. Payout: 2× your bet.',
        'Hit 2: The two digits match in exact order. Result pattern: 1-2. Payout: 25× your bet.',
        'If the last digit does not match, there is no win on Chance.'
      ]
    },
    {
      name: 'Rumble (Any Order)',
      description: [
        'You win if your numbers match the winning numbers in any order.',
        'Example: If you play 1-2, you win if the result is 1-2 or 2-1.',
        'Payout: 30× your bet.'
      ]
    }
  ];

  prizeSummaryLines: string[] = [
    'Straight → Example 1-2 → Result 1-2 → Exact order → 60×',
    'Rumble → Example 1-2 → Result 2-1 → Any order → 30×',
    'Chance Hit 1 → Example 1-2 → Result 5-2 → Last digit match → 2×',
    'Chance Hit 2 → Example 1-2 → Result 1-2 → Two match in exact order → 25×'
  ];

  drawInfoText = 'Draws typically occur twice daily (Afternoon and Evening). Results are published immediately after each draw.';

  highlights: string[] = [
    'Server or machine-generated draws (certified RNG).',
    'Multi-device availability: terminals, mobile devices, or websites.',
    'Operators may adjust bet limits, payouts, and draw frequency.'
  ];

  examples: string[] = [
    'Bet 5 XAF Straight on 1-2 → Result 1-2 → Win 300 XAF .',
    'Bet 5 XAF  Rumble on 1-2 → Result 2-1 → Win 150 XAF .',
    'Bet 5 XAF  Chance on 1-2 → Result 4-2 → Hit 1 → Win 10 XAF .',
    'Bet 5 XAF  Chance on 1-2 → Result 1-2 → Hit 2 → Win 125 XAF .'
  ];

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParamMap.subscribe(() => {
      // Skip the first emission to avoid an unnecessary initial remount.
      if (!this.hasInitializedQueryParams) {
        this.hasInitializedQueryParams = true;
        return;
      }

      this.reloadHomepageContent();
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  private reloadHomepageContent(): void {
    this.shouldRenderContent = false;
    setTimeout(() => {
      this.shouldRenderContent = true;
    });
  }

}

