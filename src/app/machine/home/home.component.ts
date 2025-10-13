import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { machineMenuRoutes } from '../machine-route';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit {
  machineMenu: any = [];

  games: any = []

  isOnline = navigator.onLine

  constructor(
    private cacheSrv: CacheService,
    private router: Router,
    private machineSrv: MachineService
  ) {
    this.getMenu()

  }

  async ngOnInit() {
    let machineData = await this.machineSrv.getMachineData()
    let games = machineData?.Games
    games.forEach((gameItem: any) => {
      gameItem.ShowGame = false
      if ((this.isOnline) || (!this.isOnline && gameItem.AllowHybrid)) {
        gameItem.ShowGame = true
      }
    });
    ////console.log(games)
    this.games = games.filter((gameItem: any) => gameItem.ShowGame)
  }

  async getMenu() {
    //console.log(machineMenuRoutes)
    machineMenuRoutes.forEach(async (routeItem: any) => {
      if ((this.isOnline) || (!this.isOnline && routeItem.AllowHybrid)) {
        if (routeItem.data.PermissionName) {
          if (await this.machineSrv.getMachinePermission(routeItem.data.PermissionName) && routeItem.data.showLink) {
            //console.log(routeItem)
            this.machineMenu.push(routeItem)
          }
        }
        else if (routeItem.data.showLink) {
          this.machineMenu.push(routeItem)
        }
      }

    })
    //console.log(this.machineMenu)
  }

  selectGame(game: any) {
    //console.log(game)
    let url = game.GameApi.split('/')[1]
    this.router.navigate([`/Machine/${url}`])
  }

  async logout() {
    await this.cacheSrv.removeFromFlutterOfflineCache("user_data");
    this.router.navigate(['/Machine']);
  }
}

