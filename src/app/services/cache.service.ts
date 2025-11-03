import { Injectable } from '@angular/core';
import { NativeBridgeService } from './native-bridge.service';
import { catchError, filter, firstValueFrom, of, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class CacheService {


  constructor(private bridge: NativeBridgeService) {
    (window as any).onCacheLoaded = (key: string, cachedValue: any) => {
      const callbacks = this.cacheCallbacks[key];
      if (callbacks?.length) {
        callbacks.forEach((cb: any) => cb(cachedValue));
        delete this.cacheCallbacks[key]; // clean up all after calling
      }
    };
  }

  saveToFlutterOfflineCache(key: string, data: any) {
    try {
      if ((window as any).OfflineCache) {
        const message = {
          action: 'save',
          key: key,
          value: JSON.stringify(data) // send raw API response as JSON string
        };
        (window as any).OfflineCache.postMessage(JSON.stringify(message));
        //console.log(`💾 Saved to OfflineCache with key: ${key}`);
      } else {
        console.warn('⚠️ OfflineCache channel not found');
      }
    } catch (err) {
      console.error('❌ Error sending to OfflineCache', err);
    }
  }

  saveTicketToDb(response: any, params: any, paramsBeforeEncryption: any) {
    console.log('💾 Saving ticket to OfflineCache DB...', response, params, paramsBeforeEncryption);

    let isOfflineFlag = 1
    if (navigator.onLine) {
      isOfflineFlag = 0
    }
    //console.log(isPrintedFlag)
    try {
      if ((window as any).OfflineCache) {
        const message = {
          action: 'save_ticket',
          FullTicketId: response.FullTicketId,
          EncryptedRequest: params.EncryptedRequestDTO,
          Amount: params.amount,
          GameId: paramsBeforeEncryption.GameId,
          IsOffline: isOfflineFlag,
          IssueDate: paramsBeforeEncryption.TimeStamp, // send raw API response as JSON string
          IsPrinted: paramsBeforeEncryption.Ticket.IsPrinted,
          IsCorrupted: !paramsBeforeEncryption.Ticket.IsPrinted,
          PersonId: paramsBeforeEncryption.PersonId,
          GameEventId: paramsBeforeEncryption.Ticket.GamePick[0].GameEventId,
          GameEventIds: paramsBeforeEncryption.Ticket.GamePick.map((pickItem: any) => pickItem.GameEventId).join(","),
          TicketRequestId: paramsBeforeEncryption.TicketRequestId,
          PromotionRequestId: '0',
          IsCanceled: 0,
          IsSync: 0,
          IsCancelSync: 0,
          isCancelLatest: 0,
          IssueTicketRequestObject: JSON.stringify(params),
          CancelTicketRequestObject: '',
        };
        (window as any).OfflineCache.postMessage(JSON.stringify(message));
        //sub.unsubscribe();
        //////console.log(`💾 Saved to OfflineCache with key: ${key}`);
      } else {
        console.warn('⚠️ OfflineCache channel not found');
      }
    } catch (err) {
      console.error('❌ Error sending to OfflineCache', err);
    }


  }

  async getTicketsFromFlutter(): Promise<any[]> {
    if (!(window as any).OfflineCache?.postMessage) {
      console.warn("⚠️ OfflineCache channel not available");
      return [];
    }

    return new Promise<any[]>((resolve) => {
      let resolved = false;
      let subscription: any;

      // Reset previous emissions so we don’t reuse stale data
      this.bridge.ticketsSource.next([]);

      // Subscribe *before* sending message
      subscription = this.bridge.tickets$.subscribe({
        next: (tickets) => {
          // ignore empty initial emission
          if (!resolved && Array.isArray(tickets) && tickets.length > 0) {
            resolved = true;
            console.log(`📦 Received ${tickets.length} pending tickets`);
            resolve(tickets);
            subscription.unsubscribe();
          }
        },
      });

      // Send the request *after* subscription is active
      const message = JSON.stringify({ action: 'get_tickets' });
      (window as any).OfflineCache.postMessage(message);
      console.log("📨 Sent get_tickets to Flutter");

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          console.warn("⏰ No response from Flutter — assuming no pending tickets");
          resolved = true;
          resolve([]);
          if (subscription) subscription.unsubscribe();
        }
      }, 2000);
    });
  }




  generateCacheKey(subRoute: string, apiRoute: string, method: string, params: any) {
    const normalizedParams = { ...params };
    delete normalizedParams.TimeStamp; // remove volatile field(s)

    return `${method}:${subRoute}/${apiRoute}/${JSON.stringify(normalizedParams)}`;
  }

  cacheCallbacks: Record<string, (value: any) => void> | any = {};

  async getFromFlutterOfflineCache(key: string): Promise<any | null> {
    return new Promise((resolve) => {
      let resolved = false;

      // Initialize array if it doesn't exist
      if (!this.cacheCallbacks[key]) {
        this.cacheCallbacks[key] = [];
      }

      // Push this request's callback into the array
      this.cacheCallbacks[key].push((cachedValue: any) => {
        try {
          if (cachedValue === null || cachedValue === undefined) {
            resolve(null);
          } else if (typeof cachedValue === "string") {
            resolve(JSON.parse(cachedValue));
          } else {
            resolve(cachedValue);
          }
        } catch (e) {
          console.error("❌ Failed to parse cached value:", e, cachedValue);
          resolve(null);
        }
      });

      if ((window as any).OfflineCache) {
        (window as any).OfflineCache.postMessage(
          JSON.stringify({ action: "get", key })
        );
      } else {
        console.warn("⚠️ OfflineCache channel not found");
        resolve(null);
      }

      // Safety timeout
      setTimeout(() => {
        if (!resolved) {
          //console.warn(`⚠️ Cache lookup for '${key}' timed out`);
          resolve(null);
          // Remove only this callback
          this.cacheCallbacks[key] = this.cacheCallbacks[key]?.filter((cb: any) => cb !== resolve);
        }
      }, 2000);
    });
  }

  async removeFromFlutterOfflineCache(key: string): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).OfflineCache) {
        const message = {
          action: 'delete',
          key: key
        };
        (window as any).OfflineCache.postMessage(JSON.stringify(message));
        //////console.log(`🗑️ Requested delete for key: ${key}`);
        resolve();
      } else {
        console.warn("⚠️ OfflineCache channel not found");
        resolve();
      }
    });
  }



  async clearFlutterOfflineCache(): Promise<void> {

    return new Promise((resolve) => {
      if ((window as any).OfflineCache) {
        (window as any).OfflineCache.postMessage(
          JSON.stringify({ action: 'clear' })
        );
        resolve();
      } else {
        console.warn('⚠️ OfflineCache channel not found');
        resolve();
      }
    });
  }

}
