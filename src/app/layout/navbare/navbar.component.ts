import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { Lang, TranslateService } from '../../core/services/translation.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  lang: Lang = 'ar';
  logoName = '';

  readonly languages: Lang[] = ['ar', 'fr', 'en'];

  constructor(
    private translateService: TranslateService,
    private supabaseService: SupabaseService
  ) {
    this.lang = this.translateService.getCurrentLang();
  }

  async ngOnInit(): Promise<void> {
    const settings = await this.supabaseService.getSiteSettings();
    this.logoName = settings?.site_name_i18n[this.lang] || '';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  setLang(lang: Lang): void {
    this.lang = lang;
    this.translateService.setLanguage(lang);
    this.closeMenu();
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }
}
