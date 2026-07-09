import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private currentLang = 'ar'; // arabe par défaut

  setLanguage(lang: string) {
    this.currentLang = lang;

    // gestion RTL/LTR
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  getLanguage() {
    return this.currentLang;
  }
}
