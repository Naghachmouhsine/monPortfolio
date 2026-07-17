import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SupabaseService } from '../../core/services/supabase.service';
import { Lang, TranslateService } from '../../core/services/translation.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('navPanel') navPanel?: ElementRef<HTMLElement>;

  isMenuOpen = false;
  lang: Lang = 'ar';
  logoName = '';

  readonly languages: Lang[] = ['ar', 'fr', 'en'];
  private langSub?: Subscription;
  private siteSettingsRaw: { site_name_i18n?: Record<Lang, string> } | null = null;

  constructor(
    private translateService: TranslateService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.lang = this.translateService.getCurrentLang();
  }

  async ngOnInit(): Promise<void> {
    this.siteSettingsRaw = await this.supabaseService.getSiteSettings();
    this.updateLogoName();

    this.langSub = this.translateService.lang$.subscribe((lang) => {
      this.lang = lang;
      this.updateLogoName();
      this.cdr.markForCheck();
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.unlockBodyScroll();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen) {
      return;
    }

    const target = event.target as Node;
    const nav = this.navPanel?.nativeElement;

    if (nav && !nav.contains(target)) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
  }

  closeMenu(): void {
    if (!this.isMenuOpen) {
      return;
    }

    this.isMenuOpen = false;
    this.unlockBodyScroll();
  }

  setLang(language: Lang): void {
    this.lang = language;
    this.translateService.setLanguage(language);
    this.closeMenu();
    this.cdr.detectChanges();
  }

  t(key: string): string {
    return this.translateService.translate(key);
  }

  isActiveRoute(route: string, exact = false): boolean {
    const url = this.router.url.split('?')[0].split('#')[0];

    if (exact) {
      return url === route || url === `${route}/`;
    }

    return url.startsWith(route);
  }

  private updateLogoName(): void {
    this.logoName =
      this.siteSettingsRaw?.site_name_i18n?.[this.lang] ||
      this.siteSettingsRaw?.site_name_i18n?.en ||
      'Portfolio';
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }
}
