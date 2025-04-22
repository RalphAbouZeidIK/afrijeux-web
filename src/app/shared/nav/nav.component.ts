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

  constructor() { }

  ngOnInit(): void {
  }
}
