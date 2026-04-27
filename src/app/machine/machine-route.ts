import { Route } from '@angular/router';
import { ValidateTicketComponent } from './validate-ticket/validate-ticket.component';
import { ReportsComponent } from './reports/reports.component';
import { SharedGuard } from '../shared.guard';
import { LoginComponent } from '../shared/login/login.component';
import { HomeComponent } from './home/home.component';
import { PrizeDetailsPageComponent } from '../static-pages/prize-details-page/prize-details-page.component';

export const machineMenuRoutes: Route[] = [
    {
        path: 'Login', component: LoginComponent,
        data: {
            showLink: false,
            title: 'routerLinks.MachineTitle.Login'
        }
    },
    {
        path: 'Games', component: HomeComponent,
        data: {
            showLink: false,
            title: 'routerLinks.MachineTitle.Home'
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'ValidateTicket',
        component: ValidateTicketComponent,
        data: {
            showLink: true,
            title: 'machine.routerLinks.verifyTicketTitle',
            PermissionName: 'TerminalCanValidateTicket',
            AllowHybrid: false
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'Reports',
        component: ReportsComponent,
        data: {
            showLink: true,
            title: 'machine.routerLinks.reports',
            PermissionName: 'TerminalCanViewReport',
            AllowHybrid: false
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'CheckResults',
        component: ReportsComponent,
        data: {
            showLink: true,
            title: 'machine.routerLinks.checkResults',
            PermissionName: 'TerminalCanViewResult',
            AllowHybrid: false
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'prize-details',
        component: PrizeDetailsPageComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.prizeDetails',
            PermissionName: 'TerminalCanViewResult',
            AllowHybrid: false
        },
        canActivate: [SharedGuard]
    }
];
