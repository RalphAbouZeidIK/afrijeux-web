import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    standalone: false
})
export class NavComponent implements OnInit {
  @Input() navList: any

  @Input() parentClass: any

  @Input() fullMenu: any

  constructor() { }

  ngOnInit(): void {
    console.log('NavComponent initialized with navList:', this.fullMenu);
  }
}
