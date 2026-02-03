import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { SignalRService, SportEventMessage } from 'src/app/services/signal-r.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-uof',
  templateUrl: './uof.component.html',
  standalone: false
})
export class UofComponent implements OnInit, OnDestroy {
  messages: SportEventMessage[] = [];
  private sub: Subscription | null = null;

  constructor(private signalR: SignalRService, private apiSrv: ApiService, private http: HttpClient) { }

  async getData() {
    let data = await this.http
      .get('https://pre-88o-sp.websbkt.com/cache/88/en/lb/Asia-Beirut/init/2/welcome-popular.json?filters=6,222')
      .toPromise();
    return data

  }

  ngOnInit(): void {
    let apiResponse = this.getData()
    this.signalR.start();
    this.sub = this.signalR.events$.subscribe(msg => {
      if (msg) {
        console.log(msg)
        // keep a short list, newest first
        this.messages.unshift(msg);
        if (this.messages.length > 100) {
          this.messages.length = 100;
          console.log(this.messages)
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.signalR.stop();
  }
}