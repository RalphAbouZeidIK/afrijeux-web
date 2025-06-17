import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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


@Injectable({
  providedIn: 'root'
})
export class NativeBridgeService {
  private scanResultSource = new BehaviorSubject<string | null>(null);
  scanResult$ = this.scanResultSource.asObservable();

  private getSerialSource = new BehaviorSubject<string | null>(null);
  getSerialSource$ = this.getSerialSource.asObservable();

  constructor(private ngZone: NgZone) {
    // Expose global handler to receive scanned QR from Flutter
    window['handleScanResult'] = (result: string) => {
      this.ngZone.run(() => {
        console.log("Received from Flutter:", result);
        this.scanResultSource.next(result); // ✅ makes it reactive
      });
    };

    // Optional: expose global print trigger (if Flutter calls it)
    window['triggerPrint'] = () => {
      this.ngZone.run(() => {
        console.log("Print requested from Flutter");
        this.print();
      });
    };

    // Optional: expose global print trigger (if Flutter calls it)
    window['handleGetSerialResult'] = (result: string) => {
      this.ngZone.run(() => {
        console.log("Received from Flutter:", result);
        this.getSerialSource.next(result); // ✅ makes it reactive
      });
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

  /** Trigger scan from Angular (calls Flutter) */
  getSerial(): void {
    if ((window as any).FlutterChannel?.postMessage) {
      (window as any).FlutterChannel.postMessage("getSerialNumber");
    } else {
      alert("get serial not supported");
    }
  }

  /** Trigger print from Angular (calls Flutter) */
  print(): void {
    if (window.PrintChannel?.postMessage) {
      window.PrintChannel.postMessage("print");
    } else {
      alert("Print not supported");
    }
  }

  /** Send structured print command to Flutter */
  sendPrintMessage(type: 'normalText' | 'barcode' | 'qrcode', value: string): void {
    const message = JSON.stringify({ type, value });

    if (window.PrintChannel?.postMessage) {
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
      console.error("Error sending image to Flutter:", error);
      alert("Failed to print image.");
    }
  }

}
