import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MachineCoreComponent } from "./machine-core/machine-core.component";
import { LoginComponent } from "../shared/login/login.component";
import { CoursesComponent } from "../pmu/courses/courses.component";


const routes: Routes = [
    {
        path: '',
        redirectTo: 'Login',  // Redirect to 'courses-libanaises' by default
        pathMatch: 'full'  // Ensure this redirect happens for the root of the submodule
    },
    {
        path: '',
        component: MachineCoreComponent,
        children: [
            {
                path: 'Login', component: LoginComponent, data: { showLink: false, title: 'routerLinks.MachineTitle.Login' }
            },
            {
                path: 'PMUHybrid/Courses', component: CoursesComponent, data: { showLink: false, title: 'routerLinks.MachineTitle.Login' }
            },
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