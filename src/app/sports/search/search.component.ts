import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  standalone: false
})
export class SearchComponent {
  showSearchBoxBool = false

  searchBoxType = ''

  searchValue = ''

  filtersSubscription: Subscription

  filterObject: any = {}

  constructor(
    private gamesSrv: GamesService,
    private router: Router
  ) {
    this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
      this.filterObject = data
    })
  }

  showSearchBox(searchBoxType: string) {
    this.showSearchBoxBool = true
    this.searchBoxType = searchBoxType
  }

  submitSearch() {
    switch (this.searchBoxType) {
      case 'gameName':
        if (this.searchValue.trim() != '') {
          this.filterObject.MatchName = this.searchValue
          this.gamesSrv.setSportsFilter(this.filterObject);
        }
        break
      case 'eventCode':
        this.router.navigate([`/Machine/AfrijeuxSportsBetting/EventCodeSearch/${parseInt(this.searchValue)}`])
        break
    }

    this.showSearchBoxBool = false
    this.searchBoxType = ''
    this.searchValue = ''

  }
}
