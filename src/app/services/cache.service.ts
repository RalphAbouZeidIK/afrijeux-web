import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor() {
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
        //console.log(`🗑️ Requested delete for key: ${key}`);
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
