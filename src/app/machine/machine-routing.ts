import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MachineCoreComponent } from "./machine-core/machine-core.component";
import { LoginComponent } from "../shared/login/login.component";
import { HomeComponent } from "./home/home.component";
import { SharedGuard } from "../shared.guard";
import { machineMenuRoutes } from "./machine-route";


const routes: Routes = [
    {
        path: '',
        redirectTo: 'Login',  // Redirect to 'courses' by default
        pathMatch: 'full'  // Ensure this redirect happens for the root of the submodule
    },
    {
        path: '',
        component: MachineCoreComponent,
        children: [
            
            ...machineMenuRoutes,
            {
                path: 'HPBPMU',
                loadChildren: () => import('../pmu/pmu.module').then(m => m.PmuModule),
                data: { breadcrumb: 'HPB PMU (Machine)', showLink: false, title: 'routerLinks.MachineTitle.Home' }
            },
            {
                path: 'Sports',
                canActivate: [SharedGuard],
                loadChildren: () => import('../sports/sports.module').then(m => m.SportsModule),
                data: { breadcrumb: 'Sports (Machine)', showLink: false, title: 'routerLinks.MachineTitle.Home' }
            },

            {
                path: 'PMUHybrid',
                canActivate: [SharedGuard],
                loadChildren: () => import('../pmu/pmu.module').then(m => m.PmuModule),
                data: { breadcrumb: 'HPB PMU (Machine)', showLink: false, title: 'routerLinks.MachineTitle.Home' }
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