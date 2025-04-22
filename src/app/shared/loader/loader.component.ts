import { Component, OnInit } from '@angular/core';
/**
   * Main loader component
   */
@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    standalone: false
})
export class LoaderComponent implements OnInit {
  /**
   * Main loader component
   */
  constructor() { }

  /**
   * On component initialize
   */
  ngOnInit(): void {
  }

}
