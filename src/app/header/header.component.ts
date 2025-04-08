import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnChanges, OnInit {
  username = ''

  @Input() isLoggedIn = false

  constructor(private localStorage: LocalStorageService) {

  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.username = this.localStorage.getItem('user_data', true).userInfo.username
    }
  }

  /**
   * On component inputs change
   */
  ngOnChanges() {
    if (this.isLoggedIn) {
      this.username = this.localStorage.getItem('user_data', true).userInfo.username
    }

  }
}
