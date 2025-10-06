import { AfterViewChecked, AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, NavigationError, NavigationStart, Router, Event } from '@angular/router';
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


  showFilters = true

  @Input() selectedFilters: any
  constructor(
    private router: Router,
    private gnrcSrv: GenericService,
    private route: ActivatedRoute,
    private gamesSrv: GamesService
  ) {
    this.route.params.subscribe(params => {
      console.log(params); // Log route params to check if they are correctly captured
    });
  }

  ngOnInit(): void {
    this.showFilters = !this.router.url.includes('Outcomes')
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    if (window.innerWidth < 1200) {
      this.isDesktop = false
    }
    this.getData()
  }


  async getData() {
    const apiResponse = await this.gnrcSrv.getFiltersLists()
    this.filtersList = apiResponse.data

    this.setSelectedToFalse()
    this.resetSelected()

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedFilters'].firstChange) {
      this.getData()
    }
  }

  resetSelected() {
    console.log(this.filtersList.sports)
    let selectedFilters = this.filtersList.sports.find((item: any) => item.sportId == this.selectedFilters.sportId)
    if (selectedFilters) {
      selectedFilters.isSelected = true
    }

    let selectedCategory = this.filtersList.categories.find((item: any) => item.categoryId == this.selectedFilters.categoryId)
    if (selectedCategory) {
      selectedCategory.isSelected = true
      this.getCategories(selectedFilters)
    }

    let selectedTournament = this.filtersList.tournaments.find((item: any) => item.tournamentId == this.selectedFilters.tournamentId)
    if (selectedTournament) {
      selectedTournament.isSelected = true
      this.getTournaments(selectedCategory)
    }

    console.log(this.selectedFilters)
    this.selectedSport = this.filtersList.sports[0]
    console.log(this.selectedSport)
    this.selectedSportChange(this.selectedSport, 'sport')
  }

  setSelectedToFalse() {
    this.filtersList.sports = this.filtersList.sports.map((obj: any) => ({
      ...obj,
      isSelected: false
    }));
    this.filtersList.categories = this.filtersList.categories.map((obj: any) => ({
      ...obj,
      isSelected: false
    }));
    this.filtersList.tournaments = this.filtersList.tournaments.map((obj: any) => ({
      ...obj,
      isSelected: false
    }));
  }

  getCategories(sportItem: any) {
    if (!sportItem.categories) {
      sportItem.categories = this.filtersList.categories.filter((item: any) => item.sportId == sportItem.sportId)
      sportItem.showCategories = true
      return
    }

    sportItem.showCategories = !sportItem.showCategories
  }

  getTournaments(categoryItem: any) {
    if (!categoryItem.tournaments) {
      categoryItem.tournaments = this.filtersList.tournaments.filter((item: any) => item.categoryId == categoryItem.categoryId)
      categoryItem.showTournaments = true
      return
    }
    categoryItem.showTournaments = !categoryItem.showTournaments
  }

  redirectTo(listItem: any) {
    console.log(listItem)
    this.router.navigate([`${this.router.url.split('/')[1]}/${listItem.sportId}${(listItem.categoryId) ? `/Categories/${listItem.categoryId}` : ''}${(listItem.tournamentId) ? `/Tournaments/${listItem.tournamentId}` : ''}`])
    listItem.isSelected = true
  }

  selectedSportChange(event: any, type: any) {
    console.log(event)
    switch (type) {
      case 'sport':
        this.selectedCategory = null
        this.selectedTournament = null
        this.dropddownTournaments = []
        this.dropddownCategories = this.filtersList.categories.filter((item: any) => item.sportId == event.sportId)
        break;
      case 'category':
        this.selectedTournament = null
        this.dropddownTournaments = this.filtersList.tournaments.filter((item: any) => item.categoryId == event.categoryId)
        break;
      default:
        break;
    }

    console.log(this.selectedSport)
    this.gamesSrv.setSportsFilter({
      sportId: this.selectedSport.sportId,
      categoryId: (this.selectedCategory) ? this.selectedCategory.categoryId : null,
      tournamentId: (this.selectedTournament) ? this.selectedTournament?.tournamentId : null
    });
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started to:', event.url);
        this.showFilters = !event.url.includes('Outcomes')
        console.log('show filters:', this.showFilters);
      }

      if (event instanceof NavigationError) {
        console.log(event.error);
      }
    });
  }

}
