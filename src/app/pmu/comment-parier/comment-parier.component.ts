import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-parier',
  templateUrl: './comment-parier.component.html',
  styleUrls: ['./comment-parier.component.scss'],
  standalone: false
})
export class CommentParierComponent {
  fullDataParier: any = [];
  constructor(private translate: TranslateService) {

    translate.onLangChange.subscribe(() => {
      this.loadTranslatedData(); // reload translated data
    });
  }

  ngOnInit() {
    this.loadTranslatedData();
  }

  loadTranslatedData() {
    this.translate.get('hpb.howToPlay.cards').subscribe((data: any[]) => {
      this.fullDataParier = data;
    });
  }
}
