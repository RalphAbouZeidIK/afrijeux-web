import { Route } from '@angular/router';
import { ValidateTicketComponent } from './validate-ticket/validate-ticket.component';
import { ReportsComponent } from './reports/reports.component';
import { SharedGuard } from '../shared.guard';
import { LoginComponent } from '../shared/login/login.component';
import { HomeComponent } from './home/home.component';
import { PrizeDetailsPageComponent } from '../static-pages/prize-details-page/prize-details-page.component';
import { RapidGamesComponent } from './rapid-games/rapid-games.component';

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
            showLink: false,
            title: 'machine.routerLinks.verifyTicketTitle',
            PermissionName: 'TerminalCanValidateTicket',
            AllowHybrid: false,
            iconLink: 'assets/images/verify-ticket-icon.png'
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'Reports',
        component: ReportsComponent,
        data: {
            showLink: true,
            title: 'machine.routerLinks.reports',
            description: 'Generate an report of printed receipts, expected cash, & tickets.',
            PermissionName: 'TerminalCanViewReport',
            AllowHybrid: false,
            iconLink: 'assets/images/report-icon.svg'
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'CheckResults',
        component: ReportsComponent,
        data: {
            showLink: true,
            title: 'machine.routerLinks.checkResults',
            description: 'View Results of previous draws.',
            PermissionName: 'TerminalCanViewResult',
            AllowHybrid: false,
            iconLink: 'assets/images/report-icon.svg'
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
            AllowHybrid: false,
            iconLink: 'assets/images/report-icon.svg'
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'AfrijeuxKeno',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.keno',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'AfrijeuxRapid',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    }

];
