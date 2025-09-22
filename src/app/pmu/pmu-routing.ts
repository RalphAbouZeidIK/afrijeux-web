import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PmuCoreComponent } from "./pmu-core/pmu-core.component";
import { MesPariesPopupComponent } from "../user/mes-paries-popup/mes-paries-popup.component";
import { ResultatComponent } from "./resultat/resultat.component";
import { CommentParierComponent } from "./comment-parier/comment-parier.component";
import { CourseDetailsPageComponent } from "./course-details-page/course-details-page.component";
import { CoursesComponent } from "./courses/courses.component";


const routes: Routes = [
  {
    path: '',
    redirectTo: 'courses',  // Redirect to 'courses' by default
    pathMatch: 'full'  // Ensure this redirect happens for the root of the submodule
  },
  {
    path: '',
    component: PmuCoreComponent,
    children: [
      {
        path: 'mes-paries', component: MesPariesPopupComponent, data: { showLink: false, title: 'routerLinks.HPBTitles.mesParies' }
      },
      {
        path: 'courses', component: CoursesComponent, data: { showLink: true, title: 'routerLinks.HPBTitles.libanaises' }
      },
      {
        path: 'courses-francaises', component: CoursesComponent, data: { showLink: true, title: 'routerLinks.HPBTitles.francaises' }
      },
      {
        path: 'resultat', component: ResultatComponent, data: { showLink: true, title: 'routerLinks.HPBTitles.resultats' }
      },
      {
        path: 'comment-parier', component: CommentParierComponent, data: { showLink: true, title: 'routerLinks.HPBTitles.commentParier' }
      },
      {
        path: 'course-details', component: CourseDetailsPageComponent, data: { showLink: false, title: 'routerLinks.HPBTitles.course' }
      }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe],
})
export class routing {
}