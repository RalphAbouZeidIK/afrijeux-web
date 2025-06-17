import { Component } from '@angular/core';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrl: './print.component.scss',
  standalone: false
})
export class PrintComponent {
  normalText = '';
  barcodeText = '';
  qrCodeText = '';

  constructor(public nativeBridge: NativeBridgeService) { }

  sendPrint(type: 'normalText' | 'barcode' | 'qrcode', value: string): void {
    if (!value?.trim()) {
      alert('Please enter a value');
      return;
    }
    this.nativeBridge.sendPrintMessage(type, value);
  }

  printImage() {
    const imageElement = document.getElementById('printableImage') as HTMLImageElement;
    if (imageElement) {
      this.nativeBridge.sendImageToPrint(imageElement);
    } else {
      alert("Image not found");
    }
  }

  scanQrCode(): void {
    this.nativeBridge.requestScan();
  }

  getSerial(): void {
    this.nativeBridge.getSerial();
  }
}
