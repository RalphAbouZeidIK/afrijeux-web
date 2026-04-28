import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription, Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-countdown',
  standalone: false,
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss'
})
export class CountdownComponent implements OnDestroy {
  private countdownSubscription: Subscription | null = null
  private destroy$ = new Subject<void>()
  countdownTime: string = ''
  countdownDays: number = 0
  countdownHours: number = 0
  countdownMinutes: number = 0
  countdownSeconds: number = 0
  @Input() smallTimer = false
  @Input() event: any

  ngOnInit(): void {
    console.log(this.event)
    if (this.event) {
      this.startCountdown(this.event);
    }
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
      this.countdownDays = 0;
      this.countdownHours = 0;
      this.countdownMinutes = 0;
      this.countdownSeconds = 0;
      return;
    }

    this.countdownDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.countdownHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.countdownMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.countdownSeconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (this.countdownDays > 0) parts.push(`${this.countdownDays}d`);
    if (this.countdownHours > 0) parts.push(`${this.countdownHours}h`);
    parts.push(`${this.countdownMinutes}m`);
    parts.push(`${this.countdownSeconds}s`);

    this.countdownTime = parts.join(' ');
  }

  padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }


  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
