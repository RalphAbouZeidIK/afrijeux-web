import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";

const routes: Routes = [
    {
        path: '',
        component: HomepageComponent
    },
]



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [DatePipe],
})
export class routing {
}