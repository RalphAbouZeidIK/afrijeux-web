import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmuCoreComponent } from './pmu-core/pmu-core.component';
import { CourseDetailsPageComponent } from './course-details-page/course-details-page.component';
import { CommentParierComponent } from './comment-parier/comment-parier.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { CoursesComponent } from './courses/courses.component';
import { HorseComponent } from './horse/horse.component';
import { SharedModule } from '../shared/shared.module';
import { routing } from './pmu-routing';
import { ResultatComponent } from './resultat/resultat.component';
import { CartComponent } from './cart/cart.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    PmuCoreComponent,
    CoursesComponent,
    CourseDetailsComponent,
    HorseComponent,
    CommentParierComponent,
    CourseDetailsPageComponent,
    ResultatComponent,
    CartComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule,
    DragDropModule
  ]
})
export class PmuModule { }