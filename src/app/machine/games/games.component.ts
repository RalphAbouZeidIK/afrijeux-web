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

  async ngOnInit() {
    let machineData = await this.machineSrv.getMachineData()
    console.log(machineData)
    this.games = machineData?.Games
    console.log(this.games)
  }

  selectGame(game: any) {
    console.log(game)
    let url = game.GameApi.split('/')[1]
    this.router.navigate([`/Machine/${url}`])
  }

}
