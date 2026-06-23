import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss'],
    standalone: false
})
export class CourseDetailsPageComponent implements OnInit {
  courseDetails: any;

  reunionData: any

  item: any

  selectedRace: any

  constructor( private actvRoute: ActivatedRoute) { }

  ngOnInit(): void {
  
  }

  async getData(reunionId: any, raceId: any) {
  
  }

  /**
   * Expand Collapse function
   */
  toggleSub(className: any, event: any) {
    let parentElement = event.srcElement.parentElement;
    while (parentElement) {
      if (parentElement.classList.contains(className)) {
        break; // Exit the loop since we found the parent
      }
      parentElement = parentElement.parentElement; // Move to the next parent
    }
    parentElement.classList.toggle('active')
  }
}
