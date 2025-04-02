import { Injectable, Inject } from '@angular/core';
import { LOCAL_STORAGE, SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';

/**
   * Local storage service
   */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  /**
   * Local storage service
   * @param storageSrv 
   * @param storage 
   */
  constructor(@Inject(LOCAL_STORAGE) private storageSrv: StorageService, @Inject(SESSION_STORAGE) private storage: StorageService) { }

  /**
   * Get item from storage and flag to use local storage
   * @param key 
   * @param useLocalStorage 
   * @returns 
   */
  getItem(key: string, useLocalStorage: boolean = false): any {
    if (useLocalStorage) {
      return this.storageSrv.get(key)
    } else {
      return this.storage.get(key);
    }
  }

  /**
   * Set storage item
   * @param key 
   * @param data 
   * @param useLocalStorage 
   */
  setItem(key: string, data: string, useLocalStorage: boolean = false): void {
    if (useLocalStorage) {
      localStorage.setItem(key, JSON.stringify(data))
    } else {
      sessionStorage.setItem(key, JSON.stringify(data))
    }
  }

  /**
   * Clear local storage where needed
   */
  clear() {
    sessionStorage.clear();
    localStorage.clear();
  }

  /**
   * Removing specific item from storage
   * @param key
   */
  removeItem(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}