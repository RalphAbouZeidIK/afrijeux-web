import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GenericService } from 'src/app/services/generic.service';
import { LanguageService } from 'src/app/services/language.service';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-pmu-core',
  templateUrl: './pmu-core.component.html',
  styleUrls: ['./pmu-core.component.scss'],
  standalone: false
})
export class PmuCoreComponent implements OnInit {

  isFullwidth = false

  navList: any
  constructor(
    private languageSrv: LanguageService,
    private translate: TranslateService,
    private machineSrv: MachineService,
  ) {
    translate.onLangChange.subscribe(() => {
      this.composeRoutes()
    });
  }

  ngOnInit(): void {
    this.composeRoutes()
  }

  composeRoutes() {
    this.navList = this.languageSrv.composeRoutes()
  }

  clearFlutterOfflineCache() {
    this.machineSrv.clearFlutterOfflineCache();
  }
}
