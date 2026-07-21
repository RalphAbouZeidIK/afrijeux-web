import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
  gamesList: any = []
  selectedGames: any = []
  FromDate: any
  ToDate: any
  dataToPrint: any
  showReport = false
  isCheckResults = window.location.href.includes('CheckResults')
  EventId: any
  genericDate: any

  yesterdayDate: Date = (() => { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d; })()
  todayDate: Date = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })()
  tommorrowDate: Date = (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d; })()
  canPrintReport = false

  isAdminLoggedIn = false

  shouldPrint = false

  //adminLoginStatusSubscription: any

  constructor(
    private machineSrv: MachineService,
    public datepipe: DatePipe,
    private router: Router
  ) {
    // this.adminLoginStatusSubscription = this.machineSrv.getAdminLoginStatus().subscribe((status) => {
    //   this.isAdminLoggedIn = status;
    //   if (status.isLoggedIn && !status.shouldShowAdminPage) {
    //     this.getReports()
    //   }
    // });
  }

  async ngOnInit() {

    this.canPrintReport = await this.machineSrv.getMachinePermission('TerminalCanPrintReport', null)
    this.getGames()
    this.genericDate = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss.SSS');
  }

  async getGames() {
    let machineData = await this.machineSrv.getMachineData()
    //console.log(machineData)
    this.gamesList = machineData?.Games.filter((game: any) => game.GameId != 49)
    this.selectedGames = (this.isCheckResults) ? [this.gamesList[0]] : [...this.gamesList]
    //console.log(this.gamesList)
  }

  selectedGamesChange(game: any, event: any) {
    const isChecked = event.target.checked;
    const index = this.selectedGames.indexOf(game);

    if (this.isCheckResults) {
      // Radio button behavior: only one selection allowed
      if (isChecked) {
        this.selectedGames = [game];
      }
    } else {
      // Checkbox behavior: multiple selections allowed
      if (isChecked && index === -1) {
        // Add game to selectedGames if checked and not already there
        this.selectedGames.push(game);
      } else if (!isChecked && index > -1) {
        // Remove game from selectedGames if unchecked
        this.selectedGames.splice(index, 1);
      }
    }
    //console.log(this.selectedGames);
  }

  onDateChange(event: any, field: keyof ReportsComponent) {
    const received = new Date(event);
    (this as any)[field] = this.datepipe.transform(received, 'yyyy-MM-ddTHH:mm:ss.SSS');
    //console.log((this as any)[field]);
  }

  showAdminPopup(shouldPrint = false) {
    this.shouldPrint = shouldPrint
    this.machineSrv.setAdminPopupStatus(true, false);
  }

  async getReports(shouldPrint = false) {
    let reportParams = {
      Date: this.FromDate,
      FromDate: this.FromDate,
      ToDate: (!this.isCheckResults) ? this.ToDate : this.genericDate,
      GameId: null,
      GameEventId: this.isCheckResults ? this.EventId : null,
      EventCode: this.isCheckResults ? this.EventId : null,
      apiRoute: this.isCheckResults ? this.selectedGames[0].GameApi.split('/')[1] : null
    }

    console.log(reportParams)

    const apiReponse = await this.machineSrv.getReports(reportParams, shouldPrint, this.isCheckResults)
    if (apiReponse.DataToPrint) {
      this.dataToPrint = apiReponse.DataToPrint
      if (!shouldPrint) {
        this.showReport = true
      }

    }

  }

  onBackClick() {
    this.router.navigate(['/Machine/Games'], { queryParams: { normalGamesShown: true } });
  }

  ngOnDestroy() {
    //this.adminLoginStatusSubscription.unsubscribe();
  }
}
