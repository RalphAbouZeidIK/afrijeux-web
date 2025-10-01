import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { MenuService } from 'src/app/services/menu.service';
import { machineMenuRoutes } from '../machine-route';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {
  machineMenu: any = [];
  constructor(
    private cacheSrv: CacheService,
    private router: Router,
    private machineSrv: MachineService
  ) {
    this.getMenu()
  }

  async getMenu() {
    console.log(machineMenuRoutes)
    machineMenuRoutes.forEach(async (routeItem: any) => {
      if (routeItem.data.PermissionName) {
        if (await this.machineSrv.getMachinePermission(routeItem.data.PermissionName) && routeItem.data.showLink) {
          console.log(routeItem)
          this.machineMenu.push(routeItem)
        }
      }
      else if (routeItem.data.showLink) {
        this.machineMenu.push(routeItem)
      }
    })
    console.log(this.machineMenu)
  }

  async logout() {
    await this.cacheSrv.removeFromFlutterOfflineCache("user_data");
    this.router.navigate(['/Machine']);
  }
}

