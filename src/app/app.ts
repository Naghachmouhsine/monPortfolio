import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
// import { TranslateService } from './core/services/translation.service';
// import { AR_TRANSLATIONS } from '../assets/18n/ar';
// import { FR_TRANSLATIONS } from '../assets/18n/fr';
// import { EN_TRANSLATIONS } from '../assets/18n/en';

@Component({
 selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {

  constructor(
    // private translate: TranslateService
  ) {
    // this.translate.setTranslations({
    //      ar: AR_TRANSLATIONS,
    //      fr: FR_TRANSLATIONS,
    //      en: EN_TRANSLATIONS
    // });
  }
}
