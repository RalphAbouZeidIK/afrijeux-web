import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
  standalone: false,
})
export class GamesComponent implements OnInit {

  constructor(
    private machineSrv: MachineService,
    private router: Router
  ) { }

  games: any = []

  isOnline = navigator.onLine

  async ngOnInit() {
    let machineData = await this.machineSrv.getMachineData()
    let games = machineData?.Games
    games.forEach((gameItem: any) => {
      gameItem.ShowGame = false
      if ((this.isOnline) || (!this.isOnline && gameItem.AllowHybrid)) {
        gameItem.ShowGame = true
      }
    });
    console.log(this.games)
    this.games = games.filter((gameItem: any) => gameItem.ShowGame)
  }

  selectGame(game: any) {
    console.log(game)
    let url = game.GameApi.split('/')[1]
    this.router.navigate([`/Machine/${url}`])
  }

}
