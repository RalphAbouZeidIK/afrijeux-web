import { AfterViewChecked, AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationError, NavigationStart, Router, Event, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-sports-list',
  templateUrl: './sports-list.component.html',
  styleUrls: ['./sports-list.component.scss'],
  standalone: false
})
export class SportsListComponent implements OnInit, OnChanges, OnDestroy {

  filtersList: any = []

  isAndroidApp: boolean = false

  selectedSport: any = null

  selectedCategory: any = null

  selectedTournament: any = null

  dropddownCategories: any = []

  dropddownTournaments: any = []

  isDesktop: any = this.gnrcSrv.getIsDesktopView()

  isDesktopSubscription: Subscription

  @Input() shouldResetFilters: boolean = false

  @Input() selectedFilters: any
  constructor(
    private router: Router,
    private gnrcSrv: GenericService,
    private route: ActivatedRoute,
    private gamesSrv: GamesService
  ) {
    this.route.params.subscribe(params => {
      ////console.log(params); // Log route params to check if they are correctly captured
    });

    this.isDesktopSubscription = this.gnrcSrv.getIsDesktopViewListener().subscribe((isDesktop) => {
      this.isDesktop = isDesktop;
    });

  }

  ngOnInit(): void {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()

    this.getData()
  }

  async getData() {
    const apiResponse = await this.gamesSrv.getFiltersLists()
    this.filtersList = apiResponse
    //console.log(this.filtersList)
    // if (this.isDesktop) {
    //   this.setSelectedToFalse()
    //   this.resetSelected()
    // }
    // else {
    //   this.selectedSport = this.filtersList.Sports[0]
    //   this.selectedSportChange(this.selectedSport, 'sport')
    // }
    this.selectedSport = this.filtersList.Sports[0]
    this.selectedSportChange(this.selectedSport, 'sport')
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldResetFilters']) {
      //console.log(changes['shouldResetFilters'])
      //console.log('Current value:', changes['shouldResetFilters'].currentValue);
    }
    if (!changes['shouldResetFilters'].currentValue) {
      //console.log('Changes detected in shouldResetFilters:', changes['shouldResetFilters'].currentValue);
      this.selectedSport = this.filtersList?.Sports[0]
      this.selectedSportChange(this.selectedSport, 'sport')
    }
  }

  resetSelected() {
    let selectedFilters = this.filtersList.Sports.find((item: any) => item.SportId == this.selectedFilters.SportId)
    if (selectedFilters) {
      selectedFilters.isSelected = true
    }

    let selectedCategory = this.filtersList.Categories.find((item: any) => item.CategoryId == this.selectedFilters.CategoryId)
    if (selectedCategory) {
      selectedCategory.isSelected = true
      this.getCategories(selectedFilters)
    }

    let selectedTournament = this.filtersList.Tournaments.find((item: any) => item.TournamentId == this.selectedFilters.TournamentId)
    if (selectedTournament) {
      selectedTournament.isSelected = true
      this.getTournaments(selectedCategory)
    }

    ////console.log(this.selectedFilters)
    this.selectedSport = this.filtersList.Sports[0]
    ////console.log(this.selectedSport)

  }

  setSelectedToFalse() {
    this.filtersList.Sports = this.filtersList.Sports.map((obj: any) => ({
      ...obj,
      isSelected: false
    }));
    this.filtersList.Categories = this.filtersList.Categories.map((obj: any) => ({
      ...obj,
      isSelected: false
    }));
    this.filtersList.Tournaments = this.filtersList.Tournaments.map((obj: any) => ({
      ...obj,
      isSelected: false
    }));
    //console.log(this.filtersList)
  }

  getCategories(sportItem: any) {
    if (!sportItem.Categories) {
      sportItem.Categories = this.filtersList.Categories.filter((item: any) => item.SportId == sportItem.SportId)
      sportItem.showCategories = true
      return
    }

    sportItem.showCategories = !sportItem.showCategories
  }

  getTournaments(categoryItem: any) {
    if (!categoryItem.Tournaments) {
      categoryItem.Tournaments = this.filtersList.Tournaments.filter((item: any) => item.CategoryId == categoryItem.CategoryId)
      categoryItem.showTournaments = true
      return
    }
    categoryItem.showTournaments = !categoryItem.showTournaments
  }

  redirectTo(listItem: any) {
    ////console.log(listItem)
    this.router.navigate([`${this.router.url.split('/')[1]}/${listItem.SportId}${(listItem.CategoryId) ? `/Categories/${listItem.CategoryId}` : ''}${(listItem.TournamentId) ? `/Tournaments/${listItem.TournamentId}` : ''}`])
    listItem.isSelected = true
  }

  selectedSportChange(event: any, type: any) {
    //console.log(event)
    switch (type) {
      case 'sport':
        this.selectedCategory = null
        this.selectedTournament = null
        this.dropddownTournaments = [];
        this.dropddownCategories = this.filtersList.Categories.filter((item: any) => item.SportId == event.SportId)
        break;
      case 'category':
        this.selectedTournament = null;
        (event) ? this.dropddownTournaments = this.filtersList.Tournaments.filter((item: any) => item.CategoryId == event.CategoryId) : this.dropddownTournaments = []


        break;
      default:
        break;
    }

    ////console.log(this.selectedSport)
    this.gamesSrv.setSportsFilter({
      SportId: (this.selectedSport) ? this.selectedSport.SportId : null,
      CategoryId: (this.selectedCategory) ? this.selectedCategory.CategoryId : null,
      TournamentId: (this.selectedTournament) ? this.selectedTournament?.TournamentId : null,
      MatchName: null,
      IsRefresh: false
    });
  }

  ngOnDestroy(): void {
    this.isDesktopSubscription.unsubscribe();
  }
}
