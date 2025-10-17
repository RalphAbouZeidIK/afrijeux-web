import { Injectable } from '@angular/core';
import { NativeBridgeService } from './native-bridge.service';

@Injectable({
  providedIn: 'root'
})


export class CacheService {

  printerError: any = null

  constructor(private bridge: NativeBridgeService) {
    (window as any).onCacheLoaded = (key: string, cachedValue: any) => {
      const callbacks = this.cacheCallbacks[key];
      if (callbacks?.length) {
        callbacks.forEach((cb: any) => cb(cachedValue));
        delete this.cacheCallbacks[key]; // clean up all after calling
      }
    };

    this.bridge.printerError$.subscribe(error => {
      console.log('🔥 Printer error detected:', error);
      this.printerError = error
      setTimeout(() => {
        this.printerError = null
      }, 1000);
    });

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
        ////console.log(`💾 Saved to OfflineCache with key: ${key}`);
      } else {
        console.warn('⚠️ OfflineCache channel not found');
      }
    } catch (err) {
      console.error('❌ Error sending to OfflineCache', err);
    }
  }

  saveTicketToDb(response: any, params: any, paramsBeforeEncryption: any) {

    // const sub = this.bridge.printerError$.subscribe(error => {
    //   console.error('🔥 Printer error detected:', error);
    //   printerError = error;
    // });

    let IssueTicketRequestObject = {
      "EncryptedRequestDTO": params.EncryptedRequestDTO
    }
    setTimeout(() => {
      let isPrintedFlag = 1;
      if (this.printerError) {
        isPrintedFlag = 0; // failed printing
      }
      console.log(isPrintedFlag)
      try {
        if ((window as any).OfflineCache) {
          const message = {
            action: 'save_ticket',
            FullTicketId: response.FullTicketId,
            EncryptedRequest: params.EncryptedRequestDTO,
            Amount: params.amount,
            GameId: paramsBeforeEncryption.GameId,
            IsOffline: 0,
            IssueDate: paramsBeforeEncryption.TimeStamp, // send raw API response as JSON string
            IsPrinted: isPrintedFlag,
            IsCorrupted: 0,
            PersonId: paramsBeforeEncryption.PersonId,
            GameEventId: paramsBeforeEncryption.Ticket.GamePick[0].GameEventId,
            GameEventIds: paramsBeforeEncryption.Ticket.GamePick.map((pickItem: any) => pickItem.GameEventId).join(","),
            TicketRequestId: paramsBeforeEncryption.TicketRequestId,
            PromotionRequestId: '0',
            IsCanceled: 0,
            IsSync: 0,
            IsCancelSync: 0,
            isCancelLatest: 0,
            IssueTicketRequestObject: JSON.stringify(IssueTicketRequestObject),
            CancelTicketRequestObject: '',
          };
          (window as any).OfflineCache.postMessage(JSON.stringify(message));
          //sub.unsubscribe();
          ////console.log(`💾 Saved to OfflineCache with key: ${key}`);
        } else {
          console.warn('⚠️ OfflineCache channel not found');
        }
      } catch (err) {
        console.error('❌ Error sending to OfflineCache', err);
      }
    }, 2000);

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
        ////console.log(`🗑️ Requested delete for key: ${key}`);
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
