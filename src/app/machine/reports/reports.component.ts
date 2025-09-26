import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  gamesList: any = []
  selectedGames: any = []
  FromDate: any
  ToDate: any
  dataToPrint: any
  showReport = false

  constructor(
    private machineSrv: MachineService,
    public datepipe: DatePipe
  ) {

  }

  ngOnInit(): void {
    this.getGames()
    console.log(this.FromDate)
  }

  async getGames() {
    let machineData = await this.machineSrv.getMachineData()
    this.gamesList = machineData?.Games
    this.selectedGames = [...this.gamesList]
    console.log(this.gamesList)
  }

  selectedGamesChange(event: any) {
    console.log(event)
  }

  onDateChange(event: any, field: keyof ReportsComponent) {
    const received = new Date(event);
    const today = new Date();

    if (
      received.getFullYear() === today.getFullYear() &&
      received.getMonth() === today.getMonth() &&
      received.getDate() === today.getDate() &&
      field == 'FromDate'
    ) {
      received.setHours(0, 0, 0, 0); // reset to 00:00
    }

    (this as any)[field] = this.datepipe.transform(received, 'yyyy-MM-ddTHH:mm:ss.SSS');
    console.log((this as any)[field]);
  }


  async getReports(shouldPrint = false) {
    console.log(this.selectedGames)
    let ids = this.selectedGames.map((item: any) => item.GameId);
    let reportParams = {
      FromDate: this.FromDate,
      ToDate: this.ToDate,
      GameId: ids
    }
    const apiReponse = await this.machineSrv.getReports(reportParams, shouldPrint)
    if (apiReponse.DataToPrint) {
      this.dataToPrint = apiReponse.DataToPrint
      if (!shouldPrint) {
        this.showReport = true
      }

    }

  }
}
