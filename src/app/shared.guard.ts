import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './services/user.service';

/**
 * Main guard to activate the routes if the user is logged in or not 
 */
@Injectable({
  providedIn: 'root'
})
export class SharedGuard  {
  /**
   * Main guard to activate the routes if the user is logged in or not 
   * @param usrSrv 
   * @param router 
   */
  constructor(private usrSrv: UserService, private router: Router) {

  }

  /**
   * Main guard to activate the routes if the user is logged in or not 
   * @param route 
   * @param state 
   * @returns 
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.usrSrv.isUserLoggedIn()) {
      return true
    }
    else {

      this.router.navigate(['']);
      return false;
    }

  }

}