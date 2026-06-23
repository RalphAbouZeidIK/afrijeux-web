import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './khamsa-routing';
import { HomepageComponent } from './homepage/homepage.component';
import { EventDetailsComponent } from './event-details/event-details.component';



@NgModule({
  declarations: [
    HomepageComponent,
    EventDetailsComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class KhamsaModule { }
