import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { machineMenuRoutes } from '../machine-route';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';

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

  isLoading = false

  constructor(
    private cacheSrv: CacheService,
    private router: Router,
    private machineSrv: MachineService,
    private nativeBridge: NativeBridgeService,
    private cacheService: CacheService
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
    //////console.log(games)
    this.games = games.filter((gameItem: any) => gameItem.ShowGame)
  }

  async getMenu() {
    ////console.log(machineMenuRoutes)
    machineMenuRoutes.forEach(async (routeItem: any) => {
      if ((this.isOnline) || (!this.isOnline && routeItem.AllowHybrid)) {
        if (routeItem.data.PermissionName) {
          if (await this.machineSrv.getMachinePermission(routeItem.data.PermissionName) && routeItem.data.showLink) {
            ////console.log(routeItem)
            this.machineMenu.push(routeItem)
          }
        }
        else if (routeItem.data.showLink) {
          this.machineMenu.push(routeItem)
        }
      }

    })
    ////console.log(this.machineMenu)
  }

  selectGame(game: any) {
    ////console.log(game)
    let url = game.GameApi.split('/')[1]
    this.router.navigate([`/Machine/${url}`])
  }

  async loadTickets() {
    this.isLoading = true;
    console.log('syncing offline tickets from DB...');
    const tickets = await this.cacheService.getTicketsFromFlutter({ IsSync: 0, IsOffline: 1 });
    if (tickets.length === 0) {
      this.isLoading = false;
      this.machineSrv.setModalData(true, true, 'All Tickets are already synced.');
      return;
    }
    await this.machineSrv.syncOfflineTickets(tickets);
    this.isLoading = false;
  }

  triggerAppUpdate() {
    try {
      if ((window as any).OfflineCache?.postMessage) {
        const message = JSON.stringify({ action: 'force_update' });
        (window as any).OfflineCache.postMessage(message);
        console.log('🚀 Requested Flutter to update Angular app');
      } else {
        console.warn('⚠️ OfflineCache bridge not found');
        alert('OfflineCache bridge not available.');
      }
    } catch (err) {
      console.error('❌ Error sending update request:', err);
    }
  }



  async logout() {
    await this.cacheSrv.removeFromFlutterOfflineCache("user_data");
    this.router.navigate(['/Machine']);
  }
}

