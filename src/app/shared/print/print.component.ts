import { Component } from '@angular/core';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrl: './print.component.scss',
  standalone: false
})
export class PrintComponent {
  normalText = ['PMU Hybrid\n---------------------------\n\n',
    "#indicator#",
    "Course:C1 30444\\Test\n10 Partants\n06/19/2025 04:09:00 PM\n\nSimple Gagnant\nCH.Joues:102\nTotale : 500 XAF\n---------------------------\nMise: 500 XAF\n06/19/2025 11:40:02 AM\nAgent: Marcelino Bou Daher\nPOS: 6666\nTicket Code: 222A1AF\nValide Au: 06/26/2025\n---------------------------"
  ];

  barcodeText = '';
  qrCodeText = '';

  constructor(public nativeBridge: NativeBridgeService) { }

  sendPrint(type: 'normalText' | 'barcode' | 'qrcode', value: string | string[]): void {
    // if (!value?.trim()) {
    //   alert('Please enter a value');
    //   return;
    // }
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
