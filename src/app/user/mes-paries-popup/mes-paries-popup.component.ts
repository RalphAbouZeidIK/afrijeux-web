import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';

@Component({
    selector: 'app-mes-paries-popup',
    templateUrl: './mes-paries-popup.component.html',
    styleUrls: ['./mes-paries-popup.component.scss'],
    standalone: false
})
export class MesPariesPopupComponent implements OnInit {


  fullDataInfo: any = [
    {
      title: "R1C1 - Paris Vincennes - Prix Cyrene",
      type: "4 + 1",
      cheval: "11-10-2-16- 13",
      date: "Aujourd’hui - 17:25",
      isGagnant: true,
      nbreMise: "400 CFA",
      class: "green"
    },
    {
      title: "R2C6 - Paris Vincennes - Prix Cyrene",
      type: "4 + 1",
      cheval: "11-10-2-16- 13",
      date: "Aujourd’hui - 17:25",
      isGagnant: true,
      nbreMise: "400 CFA",
      class: "green"
    },
    {
      title: "R1C3 - Paris Vincennes - Prix Themis",
      type: "Simple gagnat",
      cheval: "2",
      date: "Aujourd’hui - 12:46",
      isGagnant: false,
      nbreMise: "500 CFA",
      class: "red"
    },
    {
      title: "R3C6 - Paris Vincennes - Prix Themis",
      type: "Simple gagnat",
      cheval: "2",
      date: "Aujourd’hui - 12:46",
      isGagnant: false,
      nbreMise: "500 CFA",
      class: "red"
    },
  ]

  isFullPage = true
  filteredDataInfo: any;
  activeFilter: string = 'all';

  @Output() hidePopupO = new EventEmitter<any>();
  isDesktop: any
  constructor(private route: Router) {
    this.filterData(null, 'all')
    this.route.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if ((event.url == '/mes-paries')) {
          this.isFullPage = true
        }
      }
    });
  }


  ngOnInit(): void {
    if (window.innerWidth < 767) {
      this.isDesktop = false
    }
    else {
      this.isDesktop = true
    }
  }

  hidePopup() {
    if (this.isDesktop) {
      this.hidePopupO.emit(true)
    } else {

      this.route.navigate([''])
    }
  }

  filterData(isGagnant: boolean | null, filter: string) {
    this.activeFilter = filter; // Set the active filter
    if (isGagnant === null) {
      // Show all bets
      this.filteredDataInfo = this.fullDataInfo;
    } else {
      // Filter bets based on isGagnant value
      this.filteredDataInfo = this.fullDataInfo.filter((item: any) => item.isGagnant === isGagnant);
    }
  }
  onResize(event: any) {
    if (event.target.innerWidth < 767) {
      this.isDesktop = false
    }
    else {
      this.isDesktop = true
    }
  }

}
