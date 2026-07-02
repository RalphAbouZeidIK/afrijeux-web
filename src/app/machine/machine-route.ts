import { Route } from '@angular/router';
import { ValidateTicketComponent } from './validate-ticket/validate-ticket.component';
import { ReportsComponent } from './reports/reports.component';
import { SharedGuard } from '../shared.guard';
import { LoginComponent } from '../shared/login/login.component';
import { HomeComponent } from './home/home.component';
import { PrizeDetailsPageComponent } from '../static-pages/prize-details-page/prize-details-page.component';
import { RapidGamesComponent } from './rapid-games/rapid-games.component';
import { AdminDepositComponent } from '../shared/admin-deposit/admin-deposit.component';
import { AdminWithdrawComponent } from '../shared/admin-withdraw/admin-withdraw.component';
import { TicketsHistoryComponent } from './tickets-history/tickets-history.component';

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
            showLink: false,
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
        path: 'History',
        component: TicketsHistoryComponent,
        data: {
            breadcrumb: 'Tickets History',
            shouldBeLoggedIn: true,
            showLink: true,
            title: 'Tickets History',
            iconLink: 'assets/images/tickets-history.svg'
        }
    },
    {
        path: 'WinBigKeno',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.keno',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapid',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapidEmojis',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapidFootball',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapidFruits',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapidLuxury',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapidNumbers',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'WinBigRapidNumbersLite',
        component: RapidGamesComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.rapid',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'OnlineMaster/Deposit',
        component: AdminDepositComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.deposit',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },
    {
        path: 'OnlineMaster/Withdraw',
        component: AdminWithdrawComponent,
        data: {
            showLink: false,
            title: 'machine.routerLinks.withdraw',
            AllowHybrid: false,
        },
        canActivate: [SharedGuard]
    },

];
