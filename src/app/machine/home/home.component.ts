import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent implements OnInit {

  //carouselImages: { id: string; url: string; alt: string }[] = [];
  carouselImages = [
    { id: '1', url: 'assets/images/banner1-new.png', alt: 'Banner 1' },
    { id: '2', url: 'assets/images/banner2-new.png', alt: 'Banner 2' },
    { id: '3', url: 'assets/images/banner3-new.png', alt: 'Banner 3' },
    { id: '4', url: 'assets/images/banner4-new.png', alt: 'Banner 4' },
    { id: '6', url: 'assets/images/banner6-new.png', alt: 'Banner 6' }
  ];

  constructor(private apiSrv: ApiService) {

  }

  ngOnInit(): void {
    //this.getBanners();
  }

  async getBanners() {
    const response: string[] = await this.apiSrv.makeApi(`OnlineMaster`, `Corporate/GetBanners`, 'GET', {});
    if (Array.isArray(response)) {
      this.carouselImages = response.map((path, i) => ({
        id: String(i + 1),
        url: `${environment.BaseUrl.replace(':5000', ':5006')}${path.replace(/^\//, '')}`,
        alt: `Banner ${i + 1}`
      }));
    }
  }
}

