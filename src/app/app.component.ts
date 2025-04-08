import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from './services/user.service';
import { LoaderService } from './services/loader-service.service';
import { Event, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'afrijeux-web';

  /**
    * Flag to toggle loader
    */
  isLoading = false


  /**
   * Flag to check if user is logged in
   */
  isLoggedIn = false


  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription;

  /**
   * Main app component with list of services included
   * @param translate 
   * @param loaderService 
   * @param usrSrv 
   */
  constructor(
    private usrSrv: UserService,
    private changeDetectorRef: ChangeDetectorRef,
    private loaderService: LoaderService,
    private router: Router
  ) {

    this.isLoggedIn = this.usrSrv.isUserLoggedIn();
    /** Subscribe to login */
    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.changeDetectorRef.detectChanges()
    });
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
      }

      if (event instanceof NavigationEnd) {
        if (this.usrSrv.sessionExpired()) {
          this.usrSrv.signOut()
          this.router.navigate(['Login'])
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
}
