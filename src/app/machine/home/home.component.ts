import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {
  constructor(
    private machineSrv: MachineService,
    private router: Router
  ) { }

  async logout() {
    await this.machineSrv.removeFromFlutterOfflineCache("user_data");
    this.router.navigate(['/Machine']);
  }
}

