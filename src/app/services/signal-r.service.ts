import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SportEventMessage {
  msgType?: string;
  eventId?: string;
  producerInfo?: string;
  RequestId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private eventSubject = new BehaviorSubject<SportEventMessage | null>(null);
  public events$: Observable<SportEventMessage | null> = this.eventSubject.asObservable();

  // Change this URL to your backend endpoint if different (http://localhost:5000/uofHub or https://localhost:5001/uofHub)
  private hubUrl = 'http://10.1.3.73:5000/hubs/odds';

  public start(): void {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true }) // server has CORS allowing http://localhost:4200
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connected');
        this.registerHandlers();
      })
      .catch(err => console.error('SignalR start error:', err));
  }

  private registerHandlers(): void {
    this.hubConnection?.on('ReceiveEvent', (data: SportEventMessage) => {
      // data shape matches the DTO you send from server (MsgType, EventId, ProducerInfo, RequestId)
      this.eventSubject.next(data);
    });
  }

  public stop(): void {
    this.hubConnection?.stop().catch(err => console.error('SignalR stop error:', err));
    this.hubConnection = null;
  }
}