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
  isCheckResults = window.location.href.includes('CheckResults')
  EventId: any
  genericDate: any

  canPrintReport = false

  constructor(
    private machineSrv: MachineService,
    public datepipe: DatePipe
  ) {

  }

  async ngOnInit() {
    this.canPrintReport = await this.machineSrv.getMachinePermission('TerminalCanPrintReport', null)
    this.getGames()
    this.genericDate = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS');
  }

  async getGames() {
    let machineData = await this.machineSrv.getMachineData()
    this.gamesList = machineData?.Games
    this.selectedGames = (this.isCheckResults) ? [this.gamesList[0]] : [...this.gamesList]
    //console.log(this.gamesList)
  }

  selectedGamesChange(event: any) {
    //console.log(event)
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
    //console.log((this as any)[field]);
  }


  async getReports(shouldPrint = false) {
    //console.log(this.selectedGames)
    let ids = (this.isCheckResults) ? this.selectedGames[0].GameId : this.selectedGames.map((item: any) => item.GameId);
    let reportParams = {
      FromDate: this.FromDate,
      ToDate: (!this.isCheckResults) ? this.ToDate : this.genericDate,
      GameId: ids,
      GameEventId: this.isCheckResults ? this.EventId : null,
      EventCode: this.isCheckResults ? this.EventId : null,
      apiRoute: this.isCheckResults ? this.selectedGames[0].GameApi.split('/')[1] : null
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
