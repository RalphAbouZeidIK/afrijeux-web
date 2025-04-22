import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Push notifications component
 */
@Component({
  selector: 'app-notifications-popup',
  templateUrl: './notifications-popup.component.html',
  styleUrls: ['./notifications-popup.component.scss'],
  standalone:false
})
export class NotificationsPopupComponent {
  /**
   * List of notifications 
   */
  @Input() list: any

  /**
   * Remove notification from list event emitter
   */
  @Output() removeNotificationOutput = new EventEmitter<any>();

  /**
   * Remove notification from list function
   * @param notification 
   */
  removeNotification(notification: any) {
    this.removeNotificationOutput.emit(notification)
  }
}
