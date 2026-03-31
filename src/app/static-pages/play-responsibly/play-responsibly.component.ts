import { Component } from '@angular/core';

interface GuidelineItem {
  title: string;
  description: string;
}

interface WarningSignItem {
  number: number;
  text: string;
}

@Component({
  selector: 'app-play-responsibly',
  standalone: false,
  templateUrl: './play-responsibly.component.html',
  styleUrl: './play-responsibly.component.scss'
})
export class PlayResponsiblyComponent {
  heroIllustration = 'assets/images/p-r-hero.svg';

  guidelines: GuidelineItem[] = [
    {
      title: 'Set a Budget',
      description: 'Only spend what you can afford to lose. Never borrow money to play or chase losses.'
    },
    {
      title: 'Manage Your Time',
      description: 'Set time limits for playing and take regular breaks to maintain perspective.'
    },
    {
      title: 'Keep It Fun',
      description: 'Remember that lottery games are entertainment, not a way to make money or solve financial problems.'
    },
    {
      title: 'Age Restrictions',
      description: 'You must be 18 years or older to participate. Never purchase tickets for minors.'
    },
    {
      title: 'Take Breaks',
      description: "If you're playing regularly, consider taking extended breaks to reset your habits."
    },
    {
      title: 'Know the Odds',
      description: 'Understand that lottery games have very low odds of winning. Play for fun, not expectation.'
    }
  ];

  warningSigns: WarningSignItem[] = [
    { number: 1, text: 'Spending more money or time on lottery games than you can afford' },
    { number: 2, text: 'Borrowing money or selling possessions to play' },
    { number: 3, text: 'Feeling preoccupied with playing or planning your next game' },
    { number: 4, text: 'Lying to family or friends about your gaming habits' },
    { number: 5, text: 'Neglecting work, school, or family responsibilities' },
    { number: 6, text: 'Trying to win back losses by playing more (chasing losses)' },
    { number: 7, text: 'Feeling restless or irritable when trying to cut down' },
    { number: 8, text: 'Using lottery gaming as a way to escape problems or relieve stress' }
  ];

  onContactSupport(): void {
    // Placeholder for future support-flow integration.
  }

}
