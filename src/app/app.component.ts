import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from './services/user.service';
import { NavigationEnd, NavigationError, NavigationStart, Router, Event } from '@angular/router';
import { LocalStorageService } from './services/local-storage.service';
import { LoaderService } from './services/loader-service.service';
import { GenericService } from './services/generic.service';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './services/page-title.service';
import { NativeBridgeService } from './services/native-bridge.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'PMU';
  isFullwidth = false
  scanned = '';
  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription;


  loginPopupStatusSubscription: Subscription;

  /**
   * Flag to check if user is logged in
   */
  isLoggedIn = false

  loginObject = {
    show: false,
    type: 'login'
  }

  /**
    * Flag to toggle loader
    */
  isLoading = false
  routes: any;
  navList: any;

  /**
   * Array to store notifications list 
   */
  notificationsList: any = []
  scannedResult: any = '';

  constructor(
    private translate: TranslateService,
    private usrSrv: UserService,
    private router: Router,
    private loaderService: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private gnrcSrv: GenericService,
    private pageTitleService: PageTitleService,
    private bridge: NativeBridgeService
  ) {


    translate.setDefaultLang('en');
    translate.use('en');

    this.isLoggedIn = this.usrSrv.isUserLoggedIn();
    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.getMenuItems()
    });

    this.loginPopupStatusSubscription = this.usrSrv.getLoginPopupStatus().subscribe((data) => {
      console.log(data)
      this.loginObject = data
    });
    console.log(this.isLoggedIn)

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        document.querySelector('.header-main')?.classList.remove("active-mobile-menu");
        if ((event.url == '/resultat') || (event.url == '/comment-parier')) {
          this.isFullwidth = true
        } else {
          this.isFullwidth = false
        }
      }
    });

    this.usrSrv.$notifyUsers().subscribe((event: any) => {
      this.notificationsList.push({
        msg: event.message,
        isLatest: false,
        id: Date.now(),
        type: event.type
      })
      setTimeout(() => {
        this.notificationsList[this.notificationsList.length - 1].isLatest = true
      }, 100);

      setTimeout(() => {
        if (this.notificationsList.length > 0) {
          this.notificationsList[0].isLatest = false
          setTimeout(() => {
            this.notificationsList.splice(0, 1)
          }, 500);

        }
      }, 10000);
    });

  }


  ngOnInit(): void {
    console.log(typeof (Math.floor(Math.random() * 1e12).toString()))
    this.isLoggedIn = this.usrSrv.isUserLoggedIn();
    this.getMenuItems()
    this.pageTitleService.init();

    this.bridge.scanResult$.subscribe((result) => {
      if (result) {
        this.scanned = result;
      }
    });

    this.bridge.scanResult$.subscribe(result => {
      this.scannedResult = result;
      if (result) {
        alert(`Scanned result: ${result}`);
      }
    });

    if (this.bridge.isInAndroidWebView()) {
      alert("📱 You're running inside an Android WebView!");
    } else {
      alert("🌐 You're running in a normal browser.");
    }
    alert(navigator.userAgent);
  }


  /**
   * Set loading flag after the view init
   */
  ngAfterViewInit() {
    //window.console.log = () => { }
    setTimeout(() => {
      this.setLoader()
    }, 1);
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        if (this.usrSrv.getUserToken()) {
          this.refreshToken()
        }


      }

      if (event instanceof NavigationEnd) {

        if (this.usrSrv.sessionExpired()) {
          this.usrSrv.signOut()
          this.router.navigate([''])
        }
        document.body.classList.remove("show-mobile-menu")
      }

      if (event instanceof NavigationError) {
        console.log(event.error);
      }
    });
  }

  /**
   * Loader subscriber
   */
  setLoader() {
    this.loaderService.httpProgress().subscribe((status: boolean) => {
      if (status) {
        this.isLoading = true
      } else {
        this.isLoading = false
      }
      this.changeDetectorRef.detectChanges()
    });

  }

  getMenuItems() {
    this.routes = this.router.config;

    const shouldShowLinks = this.isLoggedIn;

    this.router.config.forEach((menuItem: any) => {
      if (menuItem.data.shouldBeLoggedIn) {
        menuItem.data.showLink = shouldShowLinks;
      }
    });

    this.navList = this.router.config.filter((item: any) => item.data.showLink);

    console.log(this.navList);

  }

  async refreshToken() {
    return
    const apiResponse = await this.gnrcSrv.refreshToken()
  }


  /**
   * Hide notification
   * @param notification 
   */
  removeNotificaiton(notification: any) {
    const notificationFromList = this.notificationsList.find((item: any) => item.id == notification.id)
    notificationFromList.isLatest = false
    setTimeout(() => {
      let notificationIndex = this.notificationsList.findIndex((item: any) => item.id == notification.id)
      this.notificationsList.splice(notificationIndex, 1)
    }, 400);

  }

  changeLanguage() {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  onScan() {
    this.bridge.requestScan();
  }

  onPrint() {
    this.bridge.print();
  }
}
