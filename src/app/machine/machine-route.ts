import { Route } from '@angular/router';
import { ValidateTicketComponent } from './validate-ticket/validate-ticket.component';
import { ReportsComponent } from './reports/reports.component';
import { SharedGuard } from '../shared.guard';
import { LoginComponent } from '../shared/login/login.component';
import { HomeComponent } from './home/home.component';

export const machineMenuRoutes: Route[] = [
    {
        path: 'Login', component: LoginComponent,
        data: {
            showLink: false,
            title: 'routerLinks.MachineTitle.Login'
        }
    },
    {
        path: 'Home', component: HomeComponent,
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
            title: 'machine.routerLinks.validateTicketTitle',
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
    }
];
