import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './static-pages-routing';
import { HomepageComponent } from './homepage/homepage.component';
import { HeroBannerComponent } from './hero-banner/hero-banner.component';
import { GamesListComponent } from './games-list/games-list.component';
import { PreviousResultsComponent } from './previous-results/previous-results.component';
import { PromoHeroComponent } from './promo-hero/promo-hero.component';
import { ResponsibleGamingBannerComponent } from './responsible-gaming-banner/responsible-gaming-banner.component';
import { PagesCoreComponent } from './pages-core/pages-core.component';
import { LegalPageContentComponent } from './play-responsibly/legal-page-content/legal-page-content.component';
import { PrivacyPolicyComponent } from './play-responsibly/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './play-responsibly/terms-of-service/terms-of-service.component';
import { CookiesSettingsComponent } from './play-responsibly/cookies-settings/cookies-settings.component';
import { PlayResponsiblyComponent } from './play-responsibly/play-responsibly.component';
import { BrandedProductsComponent } from './branded-products/branded-products.component';
import { BrandingShowcaseBlockComponent } from './branded-products/components/branding-showcase-block/branding-showcase-block.component';
import { BrandingBenefitCardComponent } from './branded-products/components/branding-benefit-card/branding-benefit-card.component';
import { BpHeroComponent } from './branded-products/components/bp-hero/bp-hero.component';
import { EventBrandingComponent } from './event-branding/event-branding.component';



@NgModule({
  declarations: [
    PagesCoreComponent,
    HomepageComponent,
    HeroBannerComponent,
    GamesListComponent,
    PreviousResultsComponent,
    PromoHeroComponent,
    ResponsibleGamingBannerComponent,
    LegalPageContentComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    CookiesSettingsComponent,
    PlayResponsiblyComponent,
    BrandedProductsComponent,
    BrandingShowcaseBlockComponent,
    BrandingBenefitCardComponent,
    BpHeroComponent,
    EventBrandingComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class StaticPagesModule { }
