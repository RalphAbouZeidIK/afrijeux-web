import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { MenuItem, MenuService } from 'src/app/services/menu.service';
import { UserRouteConfig } from 'src/app/services/routing.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnChanges {
  type: any = ''

  showDocumentsPopup = false

  showMesParis = false

  @Input() isLoggedIn: any = false

  isDesktop: any = this.gnrcSrv.getIsDesktopView()

  isDesktopSubscription: Subscription

  mobileMenuHidden = false

  routes: any[] = [];

  @Input() navList: any

  personNavList: any = [];

  balanceSubsription: Subscription;

  langChangeSub: Subscription | undefined;

  userBalance: any

  selectedLanguage = { code: 'fr', name: 'Français' }; // Default language

  languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' }
  ];

  menu: MenuItem[] = [];

  constructor(
    private usrSrv: UserService,
    private route: Router,
    private gnrcSrv: GenericService,
    private translate: TranslateService,
    private menuSvc: MenuService
  ) {

    this.isDesktopSubscription = this.gnrcSrv.getIsDesktopViewListener().subscribe((isDesktop) => {
      this.isDesktop = isDesktop;
    });

    this.balanceSubsription = this.usrSrv.getUserBalance().subscribe((data) => {
      //console.log(data)
      this.userBalance = data
    });
    this.translate.use(this.selectedLanguage.code)
  }

  async ngOnInit() {
    this.route.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.getMenu()
      });

    this.getMenu()

    if (await this.usrSrv.isUserLoggedIn()) {
      this.getUserBalance()
    }

    this.composeRoutes(); // Initial translation

    // Re-translate on language change
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.composeRoutes();
    });

  }

  async getMenu() {
    this.menu = await this.menuSvc.getMenu();
    //console.log(this.menu)
  }

  async getUserBalance() {
    this.userBalance = await this.gnrcSrv.getBalance()
  }


  logout() {
    this.usrSrv.signOut()
  }

  toggleSub(className: any, event: any) {
    document.querySelector('.header-main')?.classList.remove("active-mobile-menu");
    let parentElement = event.srcElement.parentElement;
    while (parentElement) {
      if (parentElement.classList.contains(className)) {
        break; // Exit the loop since we found the parent
      }

      parentElement = parentElement.parentElement; // Move to the next parent
    }
    parentElement.classList.toggle('active')
  }

  togglePopupFn(type: any) {
    document.querySelector('.header-main')?.classList.remove("active-mobile-menu");
    this.type = type
    this.showDocumentsPopup = !this.showDocumentsPopup;
    this.usrSrv.setLoginPopupStatus({
      show: true,
      type: this.type
    })
  }

  DropdownHeaderPopup() {
    document.getElementById("dropdown-header")?.classList.remove("active");
    if (this.isDesktop) {
      this.showMesParis = !this.showMesParis;
    } else {
      this.route.navigate(["/mes-paries"])
    }
  }

  hidePopup() {
    this.showMesParis = false
  }

  mobileToggleClick = () => {
    document.querySelector('.header-main')?.classList.toggle("active-mobile-menu");
    document.querySelector('.dropdown-header')?.classList.remove("active");

  }

  hideMenus() {
    document.querySelector('.header-main')?.classList.remove("active-mobile-menu");
    document.querySelector('.dropdown-header')?.classList.remove("active");
  }

  composeRoutes() {
    const itemsToTranslate = Object.entries(UserRouteConfig)
      .map(([key, value]) => ({ key, ...value }));

    const translationKeys = itemsToTranslate.map((item: any) => item.title);

    this.translate.get(translationKeys).subscribe(translations => {
      this.personNavList = itemsToTranslate.map(item => ({
        path: `User/${item.path}`,
        key: item.key,
        title: translations[item.title] || item.title
      }));
    });
    //console.log(this.personNavList)
  }

  changeLanguage(language: { code: string, name: string }) {
    this.selectedLanguage = language;
    this.translate.use(language.code);
    this.getMenu(); // Refresh menu with new translations
  }

  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes)
    if (!changes['isLoggedIn']?.firstChange) {
      this.getMenu()
    }
  }

  ngOnDestroy() {
    // Cleanup subscription to avoid memory leaks
    this.langChangeSub?.unsubscribe();
    this.isDesktopSubscription.unsubscribe()
    this.balanceSubsription.unsubscribe()
  }


}
