import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-sports-list',
  templateUrl: './sports-list.component.html',
  styleUrls: ['./sports-list.component.scss']
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
    this.filtersList = apiResponse
    this.setSelectedToFalse()
    this.resetSelected()

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedFilters'].firstChange) {
      this.getData()
    }
  }

  resetSelected() {

    let selectedFilters = this.filtersList.Sports.find((item: any) => item.SportId == this.selectedFilters.sportId)
    if (selectedFilters) {
      selectedFilters.isSelected = true
    }

    let selectedCategory = this.filtersList.Categories.find((item: any) => item.CategoryId == this.selectedFilters.categoryId)
    if (selectedCategory) {
      selectedCategory.isSelected = true
      this.getCategories(selectedFilters)
    }

    let selectedTournament = this.filtersList.Tournaments.find((item: any) => item.TournamentId == this.selectedFilters.tournamentId)
    if (selectedTournament) {
      selectedTournament.isSelected = true
      this.getTournaments(selectedCategory)
    }

    console.log(this.selectedFilters)
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
    console.log(listItem)
    this.router.navigate([`${location.pathname.split('/')[1]}/${listItem.SportId}${(listItem.CategoryId) ? `/Categories/${listItem.CategoryId}` : ''}${(listItem.TournamentId) ? `/Tournaments/${listItem.TournamentId}` : ''}`])
    listItem.isSelected = true
  }
}
