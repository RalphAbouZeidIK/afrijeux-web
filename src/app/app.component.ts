import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from './services/user.service';
import { NavigationEnd, NavigationError, NavigationStart, Router, Event } from '@angular/router';
import { LoaderService } from './services/loader-service.service';
import { GenericService } from './services/generic.service';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './services/page-title.service';
import { CacheService } from './services/cache.service';
import { machineMenuRoutes } from './machine/machine-route';
import { MachineService } from './services/machine.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'PMU';
  isFullwidth = false
  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription | any;


  loginPopupStatusSubscription: Subscription | any;

  /**
   * Flag to check if user is logged in
   */
  isLoggedIn: any = false

  loginObject = {
    show: false,
    type: 'login'
  }

  /**
    * Flag to toggle loader
    */
  isLoading = false
  routes: any;
  navList: any = [];

  /**
   * Array to store notifications list 
   */
  notificationsList: any = []
  scannedResult: any = '';

  isAndroidApp = false


  private resizeTimeout: any;

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      console.log('resize')

      this.gnrcSrv.setIsDesktopView(window.innerWidth > 1200);
    }, 300);
  }

  constructor(
    private translate: TranslateService,
    private usrSrv: UserService,
    private router: Router,
    private loaderService: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private gnrcSrv: GenericService,
    private pageTitleService: PageTitleService,
    private machineSrv: MachineService
  ) {


    translate.setDefaultLang('fr');
    translate.use('fr');

    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.getMenuItems()
    });
    if (!this.isAndroidApp) {
      // this.isLoggedIn will be set in ngOnInit asynchronously


      this.loginPopupStatusSubscription = this.usrSrv.getLoginPopupStatus().subscribe((data) => {
        ////console.log(data)
        this.loginObject = data
      });
      ////console.log(this.isLoggedIn)

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
  }


  async ngOnInit(): Promise<void> {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    this.gnrcSrv.setIsDesktopView(window.innerWidth > 1200)
    this.getMenuItems()

    if (!this.isAndroidApp) {
      this.isLoggedIn = await this.usrSrv.isUserLoggedIn();
      this.pageTitleService.init();
    }

  }


  /**
   * Set loading flag after the view init
   */
  ngAfterViewInit() {
    //window.////console.log = () => { }
    setTimeout(() => {
      this.setLoader()
    }, 1);
    this.router.events.subscribe((event: Event) => {
      // if (event instanceof NavigationStart) {
      //   if (this.usrSrv.getUserToken()) {
      //     this.refreshToken()
      //   }


      // }

      if (event instanceof NavigationEnd) {

        if (this.usrSrv.sessionExpired()) {
          this.usrSrv.signOut()
          this.router.navigate([''])
        }
        document.body.classList.remove("show-mobile-menu")
      }

      if (event instanceof NavigationError) {
        ////console.log(event.error);
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

  async getMenuItems() {

    if (this.isAndroidApp) {
      let machineData = await this.machineSrv.getMachineData()
      console.log(machineData)
      let games = machineData?.Games
      console.log(games)
      games.forEach((gameItem: any) => {
        this.navList.push(gameItem)

      });
    }
    else {
      this.routes = this.router.config;

      const shouldShowLinks = this.isLoggedIn;

      this.router.config.forEach((menuItem: any) => {
        if (menuItem.data.shouldBeLoggedIn) {
          menuItem.data.showLink = shouldShowLinks;
        }
      });

      this.navList = this.router.config.filter((item: any) => item.data.showLink);
    }


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



  ngOnDestroy(): void {
    this.loginStatusSubscription.unsubscribe();
    this.usrSrv.$notifyUsers().unsubscribe();
  }

}
