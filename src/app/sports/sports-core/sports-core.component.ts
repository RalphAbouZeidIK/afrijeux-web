import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-sports-core',
  templateUrl: './sports-core.component.html',
  styleUrls: ['./sports-core.component.scss']
})
export class SportsCoreComponent {
  selectedFilters: any;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.getSportsId()

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getSportsId()
      }
    });

  }

  getSportsId() {
    this.route.firstChild?.paramMap.subscribe(params => {
      let selectedFilters = {
        sportId: params.get('sportId'),
        tournamentId: params.get('tournamentId'),
        categoryId: params.get('categoryId'),
      }
      this.selectedFilters = selectedFilters // Logs sportId for the child route
    });
  }
}
