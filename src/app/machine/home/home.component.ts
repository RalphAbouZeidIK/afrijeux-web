import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {
  constructor(
    private cacheSrv: CacheService,
    private router: Router
  ) { }

  async logout() {
    await this.cacheSrv.removeFromFlutterOfflineCache("user_data");
    this.router.navigate(['/Machine']);
  }
}

