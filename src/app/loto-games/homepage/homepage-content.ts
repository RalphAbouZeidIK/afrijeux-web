import { PlayTypeRule } from '../game-playtypes/game-playtypes.component';

export type LotoGameContentKey = 'pick2' | 'pick3' | 'pick4' | 'pick5' | 'jackpot';

export interface LotoGameContent {
  introTitle: string;
  introDescription: string;
  overviewParagraphs: string[];
  howtoSteps: string[];
  playTypeRules: PlayTypeRule[];
  prizeSummaryLines: string[];
  drawInfoText: string;
  highlights: string[];
  examples: string[];
}

const commonHighlights: string[] = [
  'Server or machine-generated draws (certified RNG).',
  'Multi-device availability: terminals, mobile devices, or websites.',
  'Operators may adjust bet limits, payouts, and draw frequency.'
];

const pick2Rules: PlayTypeRule[] = [
  {
    name: 'Straight',
    description: [
      'Win if your numbers match the winning numbers in the exact order drawn.',
      'Example: If you play 1-2, you win only if the result is 1-2.',
      'Payout: 60x your bet.'
    ]
  },
  {
    name: 'Chance (Right-to-Left Match)',
    description: [
      'You win if one or more digits of your selection match the draw result from right to left, in the correct order.',
      'Hit 1: Only the last digit matches. Result pattern: x-2. Payout: 2x your bet.',
      'Hit 2: The two digits match in exact order. Result pattern: 1-2. Payout: 25x your bet.',
      'If the last digit does not match, there is no win on Chance.'
    ]
  },
  {
    name: 'Rumble (Any Order)',
    description: [
      'You win if your numbers match the winning numbers in any order.',
      'Example: If you play 1-2, you win if the result is 1-2 or 2-1.',
      'Payout: 30x your bet.'
    ]
  }
];

export const LOTO_GAME_CONTENT: Record<LotoGameContentKey, LotoGameContent> = {
  pick2: {
    introTitle: 'Pick 2 - Game Rules',
    introDescription: 'Below you will find a step-by-step guide on how to play the game.',
    overviewParagraphs: [
      'Pick 2 is a simple and exciting lottery-style game where players select a two-digit combination (each digit from 0 to 9). The game allows repetition of digits.',
      'Players may place bets using several play types: Straight, Rumble, Chance, or Reverse Straight. Each type has its own rules and payout structure.'
    ],
    howtoSteps: [
      'Choose your numbers: Select any two digits from 0 to 9 (digits may be repeated).',
      'Select a play type: Choose Straight, Rumble, Chance, or Reverse Straight.',
      'Purchase your ticket: Confirm your selection and pay the ticket cost.',
      'Check the draw: Match your numbers based on the selected play type.'
    ],
    playTypeRules: pick2Rules,
    prizeSummaryLines: [
      'Straight -> Example 1-2 -> Result 1-2 -> Exact order -> 60x',
      'Rumble -> Example 1-2 -> Result 2-1 -> Any order -> 30x',
      'Chance Hit 1 -> Example 1-2 -> Result 5-2 -> Last digit match -> 2x',
      'Chance Hit 2 -> Example 1-2 -> Result 1-2 -> Two match in exact order -> 25x'
    ],
    drawInfoText: 'Draws typically occur twice daily (Afternoon and Evening). Results are published immediately after each draw.',
    highlights: [...commonHighlights],
    examples: [
      'Bet 5 XAF Straight on 1-2 -> Result 1-2 -> Win 300 XAF.',
      'Bet 5 XAF Rumble on 1-2 -> Result 2-1 -> Win 150 XAF.',
      'Bet 5 XAF Chance on 1-2 -> Result 4-2 -> Hit 1 -> Win 10 XAF.',
      'Bet 5 XAF Chance on 1-2 -> Result 1-2 -> Hit 2 -> Win 125 XAF.'
    ]
  },
  pick3: {
    introTitle: 'Pick 3 - Game Rules',
    introDescription: 'Below you will find a step-by-step guide on how to play the game.',
    overviewParagraphs: [
      'Pick 3 is a lottery game where players select a three-digit combination (digits from 0 to 9). Digits may repeat depending on your selected play type.',
      'The game supports flexible play styles such as Straight, Rumble, and Chance-based combinations.'
    ],
    howtoSteps: [
      'Choose your numbers: Select any three digits from 0 to 9.',
      'Select a play type: Choose the betting style available for this draw.',
      'Purchase your ticket: Confirm your stake and submit the ticket.',
      'Check the draw: Compare your three digits to the published result.'
    ],
    playTypeRules: [
      {
        name: 'Straight',
        description: [
          'Win when all three digits match in the exact order.',
          'Example: 1-2-3 wins only on result 1-2-3.'
        ]
      },
      {
        name: 'Rumble',
        description: [
          'Win when all three digits match in any order.',
          'Example: 1-2-3 can win on 3-2-1 or 2-1-3.'
        ]
      },
      {
        name: 'Chance',
        description: [
          'Chance payouts can be awarded based on right-to-left partial matches.',
          'The exact payout multiplier depends on the number of matching trailing digits.'
        ]
      }
    ],
    prizeSummaryLines: [
      'Straight -> Exact order match on 3 digits.',
      'Rumble -> Any order match on 3 digits.',
      'Chance -> Partial or full right-to-left match, based on operator rules.'
    ],
    drawInfoText: 'Pick 3 follows the scheduled draw windows configured by the operator. Results are available right after the draw closes.',
    highlights: [...commonHighlights],
    examples: [
      'Straight example: 1-2-3 wins on 1-2-3.',
      'Rumble example: 1-2-3 wins on 3-1-2.',
      'Chance example: 1-2-3 may win if trailing digits match, based on configured rules.'
    ]
  },
  pick4: {
    introTitle: 'Pick 4 - Game Rules',
    introDescription: 'Below you will find a step-by-step guide on how to play the game.',
    overviewParagraphs: [
      'Pick 4 lets players select four digits from 0 to 9 and compete against the official draw result.',
      'This game is commonly played in Straight, Rumble, or Chance-like variants depending on operator configuration.'
    ],
    howtoSteps: [
      'Choose your numbers: Select any four digits.',
      'Select your play type and stake.',
      'Confirm and place your ticket.',
      'Review the draw results and compare against your ticket.'
    ],
    playTypeRules: [
      {
        name: 'Straight',
        description: [
          'All four digits must match in exact order to win.',
          'Example: 1-2-3-4 wins only on 1-2-3-4.'
        ]
      },
      {
        name: 'Rumble',
        description: [
          'All four digits must match, but order is not required.'
        ]
      },
      {
        name: 'Chance',
        description: [
          'Chance can reward trailing digit matches from right to left, based on configured tiers.'
        ]
      }
    ],
    prizeSummaryLines: [
      'Straight -> 4 digits in exact order.',
      'Rumble -> 4 digits in any order.',
      'Chance -> Trailing match tiers based on draw result.'
    ],
    drawInfoText: 'Pick 4 draws are run on the configured schedule and published as soon as each draw is validated.',
    highlights: [...commonHighlights],
    examples: [
      'Straight example: 1-2-3-4 wins on 1-2-3-4.',
      'Rumble example: 1-2-3-4 wins on 4-3-2-1.',
      'Chance example: 1-2-3-4 may win on partial trailing matches.'
    ]
  },
  pick5: {
    introTitle: 'Pick 5 - Game Rules',
    introDescription: 'Below you will find a step-by-step guide on how to play the game.',
    overviewParagraphs: [
      'Pick 5 is a five-digit lottery game where players choose combinations and play against a published draw.',
      'It offers higher complexity and typically larger potential payouts than lower Pick variants.'
    ],
    howtoSteps: [
      'Select five digits from 0 to 9.',
      'Choose your preferred play type and set your stake.',
      'Submit your ticket before draw close time.',
      'Check the official result and validate wins by your play type.'
    ],
    playTypeRules: [
      {
        name: 'Straight',
        description: [
          'All five digits must match in exact order.'
        ]
      },
      {
        name: 'Rumble',
        description: [
          'All five digits must match in any order.'
        ]
      },
      {
        name: 'Chance',
        description: [
          'Chance awards can be based on right-to-left digit matches according to configured payout tiers.'
        ]
      }
    ],
    prizeSummaryLines: [
      'Straight -> Exact order match on all 5 digits.',
      'Rumble -> Any order match on all 5 digits.',
      'Chance -> Tiered trailing-digit matches.'
    ],
    drawInfoText: 'Pick 5 draw frequency and payouts are operator-configurable. Results are published right after each draw cycle.',
    highlights: [...commonHighlights],
    examples: [
      'Straight example: 1-2-3-4-5 wins only on 1-2-3-4-5.',
      'Rumble example: 1-2-3-4-5 wins on 5-4-3-2-1.',
      'Chance example: trailing matches can return partial wins based on rule tiers.'
    ]
  },
  jackpot: {
    introTitle: 'Jackpot - Game Rules',
    introDescription: 'Below you will find a step-by-step guide on how to play the game.',
    overviewParagraphs: [
      'Jackpot is a high-value game where players choose six numbers and target the top prize pool.',
      'The jackpot game can include fixed configurations, rollover behavior, and additional reward tiers based on operator settings.'
    ],
    howtoSteps: [
      'Choose your numbers: Select six numbers within the configured range.',
      'Set your stake and submit your ticket before draw cut-off.',
      'Watch the draw announcement and compare your numbers.',
      'Claim winnings according to matched-number tiers and jackpot rules.'
    ],
    playTypeRules: [
      {
        name: 'Jackpot Match Rules',
        description: [
          'Top prize usually requires matching all drawn numbers.',
          'Lower prize tiers can be paid for matching fewer numbers, based on operator configuration.'
        ]
      },
      {
        name: 'Rollover',
        description: [
          'If no winner hits the top tier, the jackpot pool may roll over to the next draw (subject to operator rules).'
        ]
      },
      {
        name: 'Validation',
        description: [
          'All wins are validated against the official draw result and game configuration at time of play.'
        ]
      }
    ],
    prizeSummaryLines: [
      'Top Tier -> Full match of all drawn jackpot numbers.',
      'Mid Tiers -> Partial match prizes based on configured table.',
      'Rollover -> Jackpot can carry forward when top tier is not won.'
    ],
    drawInfoText: 'Jackpot draws follow scheduled windows and may include rollover mechanics for the prize pool.',
    highlights: [...commonHighlights],
    examples: [
      'Top tier example: 6-number full match wins the jackpot pool.',
      'Tiered example: 4 or 5 matches may unlock intermediate payouts.',
      'Rollover example: no top-tier winner can increase the next draw pool.'
    ]
  }
};
