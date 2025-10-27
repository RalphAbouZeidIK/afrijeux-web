import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, Subject } from 'rxjs';

declare global {
  interface Window {
    PrintChannel?: {
      postMessage: (message: string) => void;
    };
    FlutterChannel?: {
      postMessage: (message: string) => void;
    };
    ImageChannel?: {
      postMessage: (message: string) => void;
    };
    handleScanResult?: (result: string) => void;
    handleGetSerialResult?: (result: string) => void;
    triggerPrint?: () => void;
  }
}

declare global {
  interface Window {
    _isAndroidWebView?: boolean;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NativeBridgeService {
  private scanResultSource = new Subject<string>();
  scanResult$ = this.scanResultSource.asObservable();

  private getSerialSource = new BehaviorSubject<string | null>(null);
  getSerialSource$ = this.getSerialSource.asObservable();

  // ✅ NEW printer error observable
  private printerErrorSource = new BehaviorSubject<string | null>(null);
  printerError$ = this.printerErrorSource.asObservable();

  // Device info observable for getDeviceInfos handler
  private deviceInfoSource = new BehaviorSubject<{ hasSim: boolean; airplaneMode: boolean } | null>(null);
  deviceInfo$ = this.deviceInfoSource.asObservable();


  private todaySumSource = new BehaviorSubject<string | null>(null);
  todaySumSource$ = this.todaySumSource.asObservable();

  constructor(private ngZone: NgZone) {
    // Expose global handler to receive scanned QR from Flutter
    window['handleScanResult'] = (result: string) => {
      this.ngZone.run(() => {
        ////console.log("Received from Flutter:", result);
        this.scanResultSource.next(result); // ✅ makes it reactive
      });
    };

    // Optional: expose global print trigger (if Flutter calls it)
    (window as any).handleGetSerialResult = (result: string) => {
      this.ngZone.run(() => {
        this.getSerialSource.next(result);
      });
    };

    (window as any).handlePrinterError = (error: string) => {
      this.ngZone.run(() => {
        //console.error('🔥 Printer Error from Flutter:', error);
        this.printerErrorSource.next(error);
      });
    };

    (window as any).handleDeviceInfo = (info: { hasSim: boolean; airplaneMode: boolean }) => {
      this.ngZone.run(() => {
        //console.log('Device info received from Flutter:', info);
        this.deviceInfoSource.next(info); // emit value
      });
    };

    (window as any).handleTodaySum = (sum: any) => {
      //console.log('✅ Today printed sum:', sum);
      this.todaySumSource.next(sum); // Optional BehaviorSubject
    };
  }


  /** Trigger scan from Angular (calls Flutter) */
  requestScan(): void {
    if ((window as any).FlutterChannel?.postMessage) {
      (window as any).FlutterChannel.postMessage("scanQrCode");
    } else {
      alert("Scan not supported");
    }
  }

  getScanResult() {
    return this.scanResult$
  }

  /** Trigger scan from Angular (calls Flutter) */
  getSerial(): Promise<string> {
    return new Promise((resolve, reject) => {
      if ((window as any).FlutterChannel?.postMessage) {
        let sub: any;

        // Subscribe once
        sub = this.getSerialSource$.subscribe((val: any) => {
          if (val) {
            resolve(val);

            // Unsubscribe safely
            if (sub) {
              sub.unsubscribe();
            }
          }
        });

        // Ask Flutter
        (window as any).FlutterChannel.postMessage("getSerialNumber");

        // Optional: timeout to reject if Flutter doesn't respond
        setTimeout(() => {
          if (sub) sub.unsubscribe();
          reject("❌ Flutter did not respond in time");
        }, 5000); // 5 seconds
      } else {
        reject("❌ get serial not supported");
      }
    });
  }

  async getDeviceInfo(): Promise<{ hasSim: boolean; airplaneMode: boolean }> {
    const info = await firstValueFrom(
      this.deviceInfo$.pipe(filter(i => i !== null))
    );
    return info as { hasSim: boolean; airplaneMode: boolean };
  }

  getTodayPrintedSum(gameId: string | number): Promise<number> {
    return new Promise(resolve => {
      (window as any).handleTodaySum = (sum: any) => {
        resolve(sum);
      };

      (window as any).DBChannel.postMessage(
        JSON.stringify({ action: 'getTodaySum', gameId: String(gameId) })
      );
    });
  }



  /** Send structured print command to Flutter */
  sendPrintMessage(type: 'normalText' | 'barcode' | 'qrcode', value: string | string[], sender = 'IssueTicket', fullTicketId = ''): void {
    const message = JSON.stringify({ type, value, sender, fullTicketId });

    if (window.PrintChannel?.postMessage) {
      //console.log(message)
      window.PrintChannel.postMessage(message);
    } else {
      alert("PrintChannel is not available.");
    }
  }

  sendImageToPrint(imageElement: HTMLImageElement): void {
    try {
      const maxWidth = 320; // Use your printer's actual max width (could also be 384)
      const scale = maxWidth / imageElement.naturalWidth;

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = imageElement.naturalHeight * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context is null');

      // Scale down the image here!
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/png');
      const payload = JSON.stringify({
        filename: imageElement.src.split('/').pop() || 'image.png',
        mimeType: 'image/png',
        data: base64Image
      });

      if (window.ImageChannel?.postMessage) {
        window.ImageChannel.postMessage(payload);
      } else {
        alert("ImageChannel is not available.");
      }
    } catch (error) {
      //console.error("Error sending image to Flutter:", error);
      alert("Failed to print image.");
    }
  }

}
