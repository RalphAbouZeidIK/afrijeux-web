import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { UserRouteConfig } from 'src/app/services/routing.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit {
  type: any = ''

  showDocumentsPopup = false

  showMesParis = false

  @Input() isLoggedIn = false

  isDesktop = true

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

  constructor(
    private usrSrv: UserService,
    private route: Router,
    private gnrcSrv: GenericService,
    private translate: TranslateService
  ) {
    this.balanceSubsription = this.usrSrv.getUserBalance().subscribe((data) => {
      console.log(data)
      this.userBalance = data
    });
    this.translate.use(this.selectedLanguage.code)
  }

  ngOnInit(): void {
    if (window.innerWidth < 767) {
      this.isDesktop = false
    }
    if (this.usrSrv.isUserLoggedIn()) {
      this.getUserBalance()
    }

    this.composeRoutes(); // Initial translation

    // Re-translate on language change
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.composeRoutes();
    });

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


  onResize(event: any) {
    if (event.target.innerWidth < 767) {
      this.isDesktop = false
    }
    else {
      this.isDesktop = true
    }
    console.log(this.isDesktop)
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
    console.log(this.personNavList)
  }

  changeLanguage(language: { code: string, name: string }) {
    this.selectedLanguage = language;
    this.translate.use(language.code);
  }


  ngOnDestroy() {
    // Cleanup subscription to avoid memory leaks
    this.langChangeSub?.unsubscribe();
  }
}
