import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VersionService {
  private bootVersion: string | null = null;
  private enabled = false;
  private lastChecked = 0;
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000;

  async init(): Promise<void> {
    this.bootVersion = await this.fetchVersion();
    this.enabled = this.bootVersion !== null;
  }

  async checkForUpdate(): Promise<void> {
    if (!this.enabled) return;

    const now = Date.now();
    if (now - this.lastChecked < this.CHECK_INTERVAL_MS) return;
    this.lastChecked = now;

    const latest = await this.fetchVersion();
    console.log(latest)
    if (latest && latest !== this.bootVersion) {
      window.location.reload();
    }
  }

  private async fetchVersion(): Promise<string | null> {
    try {
      const res = await fetch('/version.json', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.version ?? null;
    } catch {
      return null;
    }
  }
}
