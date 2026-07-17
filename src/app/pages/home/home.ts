import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { TranslateService, Lang } from '../../core/services/translation.service';
import { LucideIconData,LucideAngularModule, Code, Smartphone, Settings, Brain, BarChart } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LucideAngularModule, RouterLink, EmptyStateComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  siteSettings!: {
    site_name: string;
    full_name: string;
    role: string;
    bio_short: string;
  };

  services: Array<{
    id: string | number;
    title: string;
    description: string;
    icon: string;
  }> = [];

  projects: Array<{
    id: string | number;
    title: string;
    description: string;
    featured: boolean;
  }> = [];

  isLoading = true;
  isReady = false;
  loadError = false;
  currentLang: Lang = 'ar';

  icons: Record<string, LucideIconData> = {
    code: Code,
    smartphone: Smartphone,
    settings: Settings,
    brain: Brain,
    chart: BarChart
  };

  private readonly HOME_PROJECT_IDS = [
    'c24c1956-05c8-4abe-9749-5737b2e145f2',
    '8b2e535e-99d6-4ba2-adfb-7c83d0b8a799',
    'e6d5b038-bdfc-4f20-add9-c986f6d664f3'
  ];

  private siteSettingsRaw: any;
  private servicesRaw: any[] = [];
  private projectsRaw: any[] = [];

  constructor(
    public translate: TranslateService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.translate.lang$.subscribe((lang) => {
      this.currentLang = lang;
      this.reloadTranslations();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadHomeData();
  }

  retryLoad(): void {
    this.loadHomeData();
  }

  private async loadHomeData(): Promise<void> {
    this.isLoading = true;
    this.loadError = false;
    this.isReady = false;

    try {
      const [siteSettings, services, projects] = await Promise.all([
        this.supabaseService.getSiteSettings(),
        this.supabaseService.getServices(),
        this.supabaseService.getProjectsByIds(this.HOME_PROJECT_IDS)
      ]);

      if (!siteSettings) {
        this.loadError = true;
        return;
      }

      this.siteSettingsRaw = siteSettings;
      this.servicesRaw = services;
      this.projectsRaw = projects;

      this.reloadTranslations();
      this.isReady = true;
      this.cdr.markForCheck();
    } catch {
      this.loadError = true;
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private reloadTranslations(): void {
    if (this.siteSettingsRaw) {
      this.siteSettings = {
        site_name: this.siteSettingsRaw.site_name_i18n?.[this.currentLang],
        full_name: this.siteSettingsRaw.full_name_i18n?.[this.currentLang],
        role: this.siteSettingsRaw.role_i18n?.[this.currentLang],
        bio_short: this.siteSettingsRaw.bio_short_i18n?.[this.currentLang]
      };
    }

    this.services = this.servicesRaw.map((s) => ({
      id: s.id,
      icon: s.icon,
      title: s.title_i18n?.[this.currentLang],
      description: s.description_i18n?.[this.currentLang]
    }));

    this.projects = this.projectsRaw.map((p) => ({
      id: p.id,
      featured: p.featured,
      title: p.title_i18n?.[this.currentLang],
      description: p.description_i18n?.[this.currentLang]
    }));
  }
}
