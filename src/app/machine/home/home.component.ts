import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { MenuService } from 'src/app/services/menu.service';
import { machineMenuRoutes } from '../machine-route';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {
  machineMenu: any;
  constructor(
    private cacheSrv: CacheService,
    private router: Router,
    private menuSvc: MenuService
  ) {
    this.getMenu()
  }

  async getMenu() {
    this.machineMenu = machineMenuRoutes.filter((routeItem: any) => routeItem.data.showLink)
    console.log(this.machineMenu)
  }

  async logout() {
    await this.cacheSrv.removeFromFlutterOfflineCache("user_data");
    this.router.navigate(['/Machine']);
  }
}

