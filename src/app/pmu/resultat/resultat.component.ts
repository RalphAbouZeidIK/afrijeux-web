import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
    selector: 'app-resultat',
    templateUrl: './resultat.component.html',
    styleUrls: ['./resultat.component.scss'],
    standalone: false
})
export class ResultatComponent implements OnInit {
  date = new Date()
  fullDataInfo: any = []

  constructor(private apiSrv: ApiService,
    private gamesSrv: GamesService) { }

  ngOnInit(): void {
    this.getResults()
  }

  /**
* Expand Collapse function
*/
  toggleSub(reunionItem: any) {
    reunionItem.isOpen = !reunionItem.isOpen;
  }

  async getResults() {
    this.fullDataInfo = await this.gamesSrv.getResults(this.date)
  }

  groupByProperty(items: any[], property: string): any[] {
    const grouped = items.reduce((result, currentItem) => {
      const key = currentItem[property];  // Group by 'events'

      // If the key doesn't exist, initialize it as an array
      if (!result[key]) {
        result[key] = [];
      }

      // Push the current item to the array for the respective event
      result[key].push(currentItem);

      return result;
    }, {});

    // Convert grouped object into an array of objects with 'name' and 'events'
    return Object.keys(grouped).map(key => ({
      name: key,  // The name of the event
      events: grouped[key],  // The array of items for that event,
      isOpen: false
    }));
  }

  onDateChange(event: any) {
    this.date = event
    this.getResults()
  }
}





