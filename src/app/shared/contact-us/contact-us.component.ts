import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  standalone: false,
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
 @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
