import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-sports-list',
  templateUrl: './sports-list.component.html',
  styleUrls: ['./sports-list.component.scss'],
  standalone:false
})
export class SportsListComponent implements OnInit, OnChanges {

  filtersList: any = []


  @Input() selectedFilters: any
  constructor(
    private router: Router,
    private gnrcSrv: GenericService,
    private route: ActivatedRoute,
    private apiSrv: ApiService
  ) {
    this.route.params.subscribe(params => {
      console.log(params); // Log route params to check if they are correctly captured
    });
  }

  ngOnInit(): void {
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
    this.router.navigate([`${location.pathname.split('/')[1]}/${listItem.sportId}${(listItem.categoryId) ? `/Categories/${listItem.categoryId}` : ''}${(listItem.tournamentId) ? `/Tournaments/${listItem.tournamentId}` : ''}`])
    listItem.isSelected = true
  }
}
