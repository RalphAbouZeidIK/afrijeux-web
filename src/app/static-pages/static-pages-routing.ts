import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";
import { TicketsComponent } from "../shared/tickets/tickets.component";
import { SharedGuard } from "../shared.guard";
import { PagesCoreComponent } from "./pages-core/pages-core.component";
import { PrivacyPolicyComponent } from "./play-responsibly/privacy-policy/privacy-policy.component";
import { TermsOfServiceComponent } from "./play-responsibly/terms-of-service/terms-of-service.component";
import { CookiesSettingsComponent } from "./play-responsibly/cookies-settings/cookies-settings.component";

const routes: Routes = [
    {
        path: '',
        component: PagesCoreComponent,
        children: [
            { path: '', component: HomepageComponent, data: { showLink: true, shouldBeLoggedIn: true, title: 'routerLinks.appTitle.mainTitle' } },
            { path: 'Tickets', component: TicketsComponent, data: { showLink: true, shouldBeLoggedIn: true, title: 'routerLinks.appTitle.Tickets' }, canActivate: [SharedGuard] },
            { path: 'privacy-policy', component: PrivacyPolicyComponent, data: { showLink: false, shouldBeLoggedIn: false, title: 'Privacy Policy' } },
            { path: 'terms-of-service', component: TermsOfServiceComponent, data: { showLink: false, shouldBeLoggedIn: false, title: 'Terms of Service' } },
            { path: 'cookies-settings', component: CookiesSettingsComponent, data: { showLink: false, shouldBeLoggedIn: false, title: 'Cookies Settings' } },
        ]
    },
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [DatePipe],
})
export class routing {
}