import { AfterViewChecked, AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationError, NavigationStart, Router, Event, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-sports-list',
  templateUrl: './sports-list.component.html',
  styleUrls: ['./sports-list.component.scss'],
  standalone: false
})
export class SportsListComponent implements OnInit, OnChanges, AfterViewInit {

  filtersList: any = []

  isAndroidApp: boolean = false

  selectedSport: any = null

  selectedCategory: any = null

  selectedTournament: any = null

  dropddownCategories: any = []

  dropddownTournaments: any = []

  isDesktop = true

  // filtersSubscription: Subscription

  // filterObject: any = {}

  showFilters = true

  @Input() selectedFilters: any
  constructor(
    private router: Router,
    private gnrcSrv: GenericService,
    private route: ActivatedRoute,
    private gamesSrv: GamesService
  ) {
    this.route.params.subscribe(params => {
      //console.log(params); // Log route params to check if they are correctly captured
    });


    // this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
    //   this.filterObject = data
    // })
  }

  ngOnInit(): void {
    this.checkIfOutcomesPage()

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkIfOutcomesPage()
      }
    });

    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    if (window.innerWidth < 1200) {
      this.isDesktop = false
    }
    this.getData()
  }

  onResize(event: any) {
    if (event.target.innerWidth < 1200) {
      this.isDesktop = false
    }
    else {
      this.isDesktop = true
    }
  }

  checkIfOutcomesPage() {
    let isOutcomesPage = this.router.url.includes('Outcomes') || this.router.url.includes('EventCodeSearch')
    this.showFilters = !isOutcomesPage
  }


  async getData() {
    if (this.showFilters) {
      const apiResponse = await this.gamesSrv.getFiltersLists()
      this.filtersList = apiResponse
      this.setSelectedToFalse()
      this.resetSelected()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedFilters'].firstChange) {
      this.getData()
    }
  }

  resetSelected() {
    console.log(this.selectedFilters)
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

    //console.log(this.selectedFilters)
    this.selectedSport = this.filtersList.Sports[0]
    //console.log(this.selectedSport)
    this.selectedSportChange(this.selectedSport, 'sport')
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
    console.log(this.filtersList)
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
    //console.log(listItem)
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

    //console.log(this.selectedSport)
    this.gamesSrv.setSportsFilter({
      SportId: (this.selectedSport) ? this.selectedSport.SportId : null,
      CategoryId: (this.selectedCategory) ? this.selectedCategory.CategoryId : null,
      TournamentId: (this.selectedTournament) ? this.selectedTournament?.TournamentId : null,
      MatchName: null
    });
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        //console.log('Navigation started to:', event.url);
        this.showFilters = !event.url.includes('Outcomes')
        //console.log('show filters:', this.showFilters);
      }

      if (event instanceof NavigationError) {
        //console.log(event.error);
      }
    });
  }

}
