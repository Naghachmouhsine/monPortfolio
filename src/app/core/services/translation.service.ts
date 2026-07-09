import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AR_TRANSLATIONS } from '../../../assets/18n/ar';
import { FR_TRANSLATIONS } from '../../../assets/18n/fr';
import { EN_TRANSLATIONS } from '../../../assets/18n/en';


export type Lang = 'ar' | 'fr' | 'en';

interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  private readonly STORAGE_KEY = 'app_lang';

  private currentLang: Lang = 'ar';

  private langSubject = new BehaviorSubject<Lang>(this.currentLang);
  lang$ = this.langSubject.asObservable();

  // ✅ HERE: external TS files instead of internal object
  private translations: Record<Lang, TranslationDictionary> = {
    ar: AR_TRANSLATIONS,
    fr: FR_TRANSLATIONS,
    en: EN_TRANSLATIONS
  };

  constructor() {
    this.initLanguage();
  }

  /**
   * Init language from localStorage
   */
  private initLanguage(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY);

    this.setLanguage(this.isLang(savedLang) ? savedLang : 'ar');
  }

  /**
   * Change language
   */
  setLanguage(lang: Lang): void {
    this.currentLang = lang;

    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    this.langSubject.next(lang);
  }

  /**
   * Translate key
   */
  translate(key: string): string {
    const value = this.resolveKey(this.translations[this.currentLang], key);

    if (typeof value === 'string') return value;

    // fallback EN → AR → key
    const fallbackEn = this.resolveKey(this.translations.en, key);
    if (typeof fallbackEn === 'string') return fallbackEn;

    const fallbackAr = this.resolveKey(this.translations.ar, key);
    if (typeof fallbackAr === 'string') return fallbackAr;

    return key;
  }

  getCurrentLang(): Lang {
    return this.currentLang;
  }

  /**
   * Resolve nested keys like HOME.CTA_CONTACT
   */
  private resolveKey(dictionary: TranslationDictionary, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, part) => {
      if (this.isDictionary(acc)) {
        return acc[part];
      }
      return undefined;
    }, dictionary);
  }

  private isDictionary(value: unknown): value is TranslationDictionary {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isLang(value: string | null): value is Lang {
    return value === 'ar' || value === 'fr' || value === 'en';
  }
}
